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
const NON_SENSOR_KEYS = new Set([
  '_id', 'Type', 'type', 'Timestamp', 'Packet', // document structure
  'WiFi', 'LTE', 'LoRa',                        // radios (signal strength, not environment)
  'Bringup',                                    // board test info (TestId), not a measurement
])

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

// 'MS5803_118' → 'MS5803', 'DFR_MultiGasSensor_0' → 'DFR_MultiGasSensor', 'SEN55' → 'SEN55'
// Strips a trailing instance number (I2C address / index) so two of the
// same sensor on one station share unit rules but stay separate readings.
export const sensorModel = (sensor) => sensor.replace(/_\d+$/, '')

// Adapted from Ear2Earth sensorNames.js: exact keys first, because
// MS5803_118 and MS5803_119 are the same model doing different jobs.
const SENSOR_NAMES = {
  TSL2591: 'Light',
  MS5803_118: 'Atmospheric',
  MS5803_119: 'Hydrostatic',
  TippingBucket: 'Rainfall Gauge',
  Teros10: 'Soil Moisture',
  A55311: 'Magnetic Encoder',
  T6793: 'CO2',
  Analog: 'Battery Voltage',
}

// Then by model, with the instance number added: 'SHT31_7' → 'Climate 7', 'SEN66_5' → 'Air Quality 5'
const MODEL_NAMES = {
  SHT31: 'Climate',
  SEN55: 'Air Quality Index', // Ear2Earth had 'Sen55', which never matched real data
  SEN66: 'Air Quality',
  MS5803: 'Pressure',
}

// DFR gas boards: which gas a board measures depends on the station, not its index
// (Ear2Earth assumed _0 = H2S, but Deploy_Test_8 has _0 = CO), so name it by its gas field.
const GAS_NAMES = { CO: 'Carbon Monoxide', SO2: 'Sulfur Dioxide', O3: 'Ozone', H2S: 'Hydrogen Sulfide' }
const isGasBoard = (model) => model === 'DFR_MultiGasSensor' || model === 'DFR_MultiGas'

export const sensorDisplayName = (sensor, fields = {}) => {
  if (SENSOR_NAMES[sensor]) return SENSOR_NAMES[sensor]
  const model = sensorModel(sensor)
  if (isGasBoard(model)) {
    const gas = Object.keys(fields).find((f) => GAS_NAMES[f])
    return gas ? GAS_NAMES[gas] : 'Gas Sensor'
  }
  const instance = sensor.match(/_(\d+)$/)?.[1]
  if (MODEL_NAMES[model]) return instance ? `${MODEL_NAMES[model]} ${instance}` : MODEL_NAMES[model]
  return sensor // unknown sensor on a new station: show the raw key
}

/* ---------- Field names and units ---------- */

// Fields whose unit is NOT in the name, or whose suffix isn't a unit.
// Lookup order: 'Model.field' → 'field' → unit suffix from UNITS → no unit.
// min/max: values outside the range are flagged 'out_of_range' (e.g. sensor error codes).
const INDEX_0_500 = { min: 0, max: 500 }

const KNOWN_FIELDS = {
  // Analog battery
  'Analog.Vbat': { variable: 'Vbat', unit: 'V' }, // assumption: confirm with the lab
  'Analog.Vbat_MV': { variable: 'Vbat_mV', unit: 'mV' },

  // SEN55: units are in the names, except the index range suffix
  'VocIndex_0-500': { variable: 'VocIndex', unit: 'index', ...INDEX_0_500 },
  'NoxIndex_1-500': { variable: 'NoxIndex', unit: 'index', ...INDEX_0_500 },

  // SEN66: no units in field names; the '_' in PM2_5 is a decimal point (Sensirion datasheet)
  'SEN66.PM1_0': { variable: 'PM1_0', unit: 'µg/m³' },
  'SEN66.PM2_5': { variable: 'PM2_5', unit: 'µg/m³' },
  'SEN66.PM4_0': { variable: 'PM4_0', unit: 'µg/m³' },
  'SEN66.PM10_0': { variable: 'PM10_0', unit: 'µg/m³' },
  'SEN66.N_PM0_5': { variable: 'N_PM0_5', unit: '#/cm³' },
  'SEN66.N_PM1_0': { variable: 'N_PM1_0', unit: '#/cm³' },
  'SEN66.N_PM2_5': { variable: 'N_PM2_5', unit: '#/cm³' },
  'SEN66.N_PM4_0': { variable: 'N_PM4_0', unit: '#/cm³' },
  'SEN66.N_PM10_0': { variable: 'N_PM10_0', unit: '#/cm³' },
  'SEN66.AmbientHumidity': { variable: 'AmbientHumidity', unit: '%RH', min: 0, max: 100 },
  'SEN66.AmbientTemperature': { variable: 'AmbientTemperature', unit: '°C' },
  'SEN66.CO2': { variable: 'CO2', unit: 'ppm' },
  'SEN66.VocIndex': { variable: 'VocIndex', unit: 'index', ...INDEX_0_500 },
  'SEN66.NoxIndex': { variable: 'NoxIndex', unit: 'index', ...INDEX_0_500 },

  // DFR gas boards (unit assumed ppm: confirm with the lab)
  'DFR_MultiGasSensor.CO': { variable: 'CO', unit: 'ppm' },
  'DFR_MultiGasSensor.SO2': { variable: 'SO2', unit: 'ppm' },
  'DFR_MultiGasSensor.O3': { variable: 'O3', unit: 'ppm' },
  'DFR_MultiGasSensor.H2S': { variable: 'H2S', unit: 'ppm' },
}

// Raw unit spellings → display unit. Only these count as units, so the '5' in
// 'PM2_5' is never mistaken for one. Compound units are listed with '_' too,
// because some firmware writes m/s as m_s.
const UNITS = {
  'C': '°C', '°C': '°C', '%RH': '%RH', 'mbar': 'mbar', 'V': 'V', 'MV': 'mV', 'mV': 'mV',
  'ppm': 'ppm', 'ppb': 'ppb', 'mm': 'mm',
  'µg/m³': 'µg/m³', 'μg/m³': 'µg/m³', // micro sign vs Greek mu: look identical, store one
  'm/s': 'm/s', 'm_s': 'm/s',
  'W/m²': 'W/m²', 'W/m2': 'W/m²', 'W_m2': 'W/m²',
  'm³/m³': 'm³/m³', 'm3/m3': 'm³/m³', 'm3_m3': 'm³/m³',
  'dS/m': 'dS/m', 'dS_m': 'dS/m',
}

// Longest first, so 'm3_m3' is tried before a shorter unit could match
const UNIT_SUFFIXES = Object.keys(UNITS).sort((a, b) => b.length - a.length)

// 'Temperature_C' → Temperature, °C      'WindSpeed_m_s' → WindSpeed, m/s
// 'Temp(C)'       → Temp, °C             'PM2_5'         → PM2_5, null
const splitName = (field) => {
  const paren = field.match(/^(.+)\(([^)]+)\)$/)
  if (paren && UNITS[paren[2]]) {
    return { variable: paren[1], unit: UNITS[paren[2]], unitSource: 'name' }
  }
  const suffix = UNIT_SUFFIXES.find((s) => field.length > s.length + 1 && field.endsWith(`_${s}`))
  if (suffix) {
    return { variable: field.slice(0, -(suffix.length + 1)), unit: UNITS[suffix], unitSource: 'name' }
  }
  return { variable: field, unit: null, unitSource: 'none' }
}

const describeField = (model, field) => {
  const known = KNOWN_FIELDS[`${model}.${field}`] ?? KNOWN_FIELDS[field]
  return known ? { ...known, unitSource: 'table' } : splitName(field)
}

/* ---------- Values ---------- */

//Sort each value
const qualityOf = (value, { min, max } = {}) => {
  if (value === null || value === undefined) return 'missing' //value is null or undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'invalid' //not a real number
  if ((min !== undefined && value < min) || (max !== undefined && value > max)) return 'out_of_range' //sensor error code
  return 'ok'
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
    const sensorName = sensorDisplayName(sensor, doc[sensor])
    return Object.entries(doc[sensor]).map(([field, value]) => {
      const { variable, unit, unitSource, min, max } = describeField(model, field)
      const quality = qualityOf(value, { min, max })
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
        quality,     // 'ok' | 'missing' | 'invalid' | 'out_of_range'
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
