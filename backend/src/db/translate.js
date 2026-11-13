/***************************************************************
 * Converts raw MongoDB sensor documents into Farm2Table's reading model.
 * This is the only file that knows the raw document shape (RFC 0002).
 * Every station can carry a different set of sensors, so nothing here
 * hard-codes a sensor list: any object on the document that isn't in
 * NON_SENSOR_KEYS is treated as a sensor.
 * Subject to change and we find out what different kinds of sensors 
 * we are going to use.
 ***************************************************************/

/* ---------- Document structure ---------- */

// Keys on a raw document that are not environmental sensors
// (Type = 'data' | 'metadata', Packet/WiFi/LTE = device + radio info)
const NON_SENSOR_KEYS = new Set(['_id', 'Type', 'type', 'Timestamp', 'Packet', 'WiFi', 'LTE'])

//Makes sure only "Key-Value" objects pass; Deny Arrays, null, ints, strings, boolean....
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// Sensor keys present on one raw document (works for any station's sensor set)
export const sensorKeys = (doc) =>
  Object.entries(doc ?? {})
    .filter(([key, value]) => !NON_SENSOR_KEYS.has(key) && isPlainObject(value))
    .map(([key]) => key)

/* ---------- Timestamps ---------- */

// Adapted from Ear2Earth index.js fixTimestamp():
// pads '9:34:48' → '09:34:48' so new Date() can parse it.
// Differences: returns null instead of the bad input, and is only used on time_utc
// (Ear2Earth used it on time_local, which shifted times by the UTC offset).
export const fixTimestamp = (ts) => {
  if (typeof ts !== 'string') return null
  const [datePart, timePart] = ts.replace('Z', '').split('T')
  if (!timePart) return null
  const time = timePart.split(':').map((p) => p.padStart(2, '0')).join(':')
  return `${datePart}T${time}Z`
}

export const parseUtc = (ts) => {
  const fixed = fixTimestamp(ts)
  const date = fixed ? new Date(fixed) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

/* ---------- Sensor names ---------- */

// Adapted from Ear2Earth sensorNames.js
// Exact keys first, because MS5803_118 and MS5803_119 are the same model doing different jobs.
const SENSOR_NAMES = {
  SHT31: 'Climate',
  TSL2591: 'Light',
  MS5803_118: 'Atmospheric',
  MS5803_119: 'Hydrostatic',
  TippingBucket: 'Rainfall Gauge',
  Teros10: 'Soil Moisture',
  A55311: 'Magnetic Encoder',
  DFR_MultiGas_0: 'Hydrogen Sulfide',
  DFR_MultiGas_1: 'Sulfur Dioxide',
  DFR_MultiGas_2: 'Ozone',
  SEN55: 'Air Quality Index', // Ear2Earth had 'Sen55', which never matched real data
  T6793: 'CO2',
  Analog: 'Battery Voltage',
}

export const sensorDisplayName = (sensor) => {
  if (SENSOR_NAMES[sensor]) return SENSOR_NAMES[sensor]
  const sht = sensor.match(/^SHT31_(\d+)$/) // SHT31_2 → 'Climate_2' (same as Ear2Earth)
  if (sht) return `Climate_${sht[1]}`
  return sensor // unknown sensor on a new station: show the raw key
}

// 'MS5803_118' → 'MS5803', 'DFR_MultiGas_0' → 'DFR_MultiGas', 'SEN55' → 'SEN55'
// Strips a trailing instance number (I2C address / index) so two of the
// same sensor on one station share unit rules but stay separate readings.
export const sensorModel = (sensor) => sensor.replace(/_\d+$/, '')

/* ---------- Field names and units ---------- */

// Fields whose name suffix is NOT a plain unit.
// Lookup order: 'Model.field' → 'field' → split the name on its last underscore.
const KNOWN_FIELDS = {
  'Analog.Vbat': { variable: 'Vbat', unit: 'V' }, // assumption: confirm with the lab
  'Analog.Vbat_MV': { variable: 'Vbat_mV', unit: 'mV' },
  'VocIndex_0-500': { variable: 'VocIndex', unit: 'index (0-500)' },
  'NoxIndex_1-500': { variable: 'NoxIndex', unit: 'index (1-500)' },
}

const UNIT_ALIASES = { C: '°C' }

// 'PM2_5_µg/m³' → { variable: 'PM2_5', unit: 'µg/m³' }
const splitName = (field) => {
  const i = field.lastIndexOf('_')
  if (i <= 0) return { variable: field, unit: null, unitSource: 'none' }
  const unit = field.slice(i + 1)
  return { variable: field.slice(0, i), unit: UNIT_ALIASES[unit] ?? unit, unitSource: 'name' }
}

const describeField = (model, field) => {
  const known = KNOWN_FIELDS[`${model}.${field}`] ?? KNOWN_FIELDS[field]
  return known ? { ...known, unitSource: 'table' } : splitName(field)
}

/* ---------- Values ---------- */

//Sort each value
const qualityOf = (value) => {
  if (value === null || value === undefined) return 'missing' //value is null or undefined
  if (typeof value === 'number' && Number.isFinite(value)) return 'ok'//value is real and finite
  return 'invalid'//anything else
}

//Incase Latitude/Longitude are stored as strings convert them, else null
const toNumberOrNull = (v) => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/* ---------- Public converters ---------- */

// One raw packet → many readings (one per sensor field)
export const toReadings = (stationId, doc) => {
  const time = parseUtc(doc?.Timestamp?.time_utc)
  if (!time) return [] // can't place it on a time axis
  const timestamp = time.toISOString()

  return sensorKeys(doc).flatMap((sensor) => {
    const model = sensorModel(sensor)
    const sensorName = sensorDisplayName(sensor)
    return Object.entries(doc[sensor]).map(([field, value]) => {
      const quality = qualityOf(value)
      const { variable, unit, unitSource } = describeField(model, field)
      return {
        stationId,
        sensor,      // 'MS5803_118'  unique on this station
        sensorName,  // 'Atmospheric' friendly name for the UI
        model,       // 'MS5803'      same for every MS5803
        variable,    // 'Pressure'
        field,       // original raw name, e.g. 'Pressure_mbar'
        value: quality === 'ok' ? value : null,
        unit,
        unitSource,  // 'table' | 'name' | 'none'  → shows which fields need a KNOWN_FIELDS entry
        timestamp,   // UTC ISO string
        quality,
      }
    })
  })
}

// Readings from many packets → one entry per sensor field with its latest value.
// Used for the per-station sensor list.
export const summarizeSensors = (readings) =>
  Object.values(
    readings.reduce((acc, r) => {
      const key = `${r.sensor}|${r.field}`
      if (!acc[key] || r.timestamp > acc[key].lastSeen) {
        acc[key] = {
          sensor: r.sensor,
          sensorName: r.sensorName,
          model: r.model,
          variable: r.variable,
          field: r.field,
          unit: r.unit,
          lastSeen: r.timestamp,
          lastValue: r.value,
          lastQuality: r.quality,
        }
      }
      return acc
    }, {})
  ).sort((a, b) => a.sensor.localeCompare(b.sensor) || a.variable.localeCompare(b.variable))

export const toMetadata = (stationId, doc) => ({
  stationId,
  deploymentDate: doc.deployment_date ?? null,
  latitude: toNumberOrNull(doc.latitude),
  longitude: toNumberOrNull(doc.longitude),
  owner: doc.owner ?? null,
})
