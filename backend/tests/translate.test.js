/***************************************************************
 * Contract tests for db/translate.js (RFC 0002).
 * No database needed: each test feeds a raw document in and
 * checks the Farm2Table reading model that comes out.
 * If the lab changes the document format, these fail first.
 ***************************************************************/
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  fixTimestamp,
  parseUtc,
  sensorDisplayName,
  sensorModel,
  sensorKeys,
  toReadings,
  summarizeSensors,
  toMetadata,
} from '../src/db/translate.js'

/* ---------- Fixtures: raw documents as they look in MongoDB ---------- */

// Station A: copied from a real packet 
const stationA = {
  _id: '6a8634d513d217d3751c0471',
  Type: 'data',
  Timestamp: { time_utc: '2026-08-19T9:34:48Z', time_local: '2026-08-19T2:34:48' },
  Packet: { Number: 1 },
  Analog: { Vbat: 4.274853706, Vbat_MV: 4284.521484 },
  LTE: { RSSI: 20 },
  SEN55: {
    'PM1_0_µg/m³': 5.980000019,
    'PM2_5_µg/m³': 6.260000229,
    'PM4_0_µg/m³': 6.260000229,
    'PM10_0_µg/m³': 6.260000229,
    'AmbientHumidity_%RH': 52.45000076,
    'AmbientTemperature_°C': 24.01000023,
    'VocIndex_0-500': 0,
    'NoxIndex_1-500': 0,
  },
  SHT31: { Temperature_C: 25.53000069, 'Humidity_%RH': 71.34999847 },
}

// Station B: made up, a different sensor set with two of the same model
const stationB = {
  Type: 'data',
  Timestamp: { time_utc: '2026-08-19T14:00:00Z' },
  WiFi: { RSSI: -60 },
  MS5803_118: { Pressure_mbar: 1013.2 },
  MS5803_119: { Pressure_mbar: null },
  Teros10: { VWC: 'ERR' },
}

// Helper: find one reading by its raw field name
const reading = (readings, field) => readings.find((r) => r.field === field)

/* ---------- Timestamps ---------- */

describe('timestamps', () => {
  test('fixTimestamp pads unpadded hours (Ear2Earth behavior)', () => {
    assert.equal(fixTimestamp('2026-08-19T9:34:48Z'), '2026-08-19T09:34:48Z')
  })

  test('parseUtc turns time_utc into a real Date', () => {
    assert.equal(parseUtc('2026-08-19T9:34:48Z').toISOString(), '2026-08-19T09:34:48.000Z')
  })

  test('parseUtc returns null for bad input instead of crashing', () => {
    for (const bad of ['2026-08-19T25:00:00Z', 'garbage', '', null, undefined, 12345]) {
      assert.equal(parseUtc(bad), null, `expected null for ${JSON.stringify(bad)}`)
    }
  })

  test('readings use time_utc, not time_local', () => {
    const [first] = toReadings('A', stationA)
    assert.equal(first.timestamp, '2026-08-19T09:34:48.000Z')
  })
})

/* ---------- Which keys count as sensors ---------- */

describe('sensor detection', () => {
  test('finds every sensor on station A and skips device/radio info', () => {
    assert.deepEqual(sensorKeys(stationA), ['Analog', 'SEN55', 'SHT31'])
  })

  test('works on a station with a completely different sensor set', () => {
    assert.deepEqual(sensorKeys(stationB), ['MS5803_118', 'MS5803_119', 'Teros10'])
  })

  test('sensorModel strips only a trailing instance number', () => {
    assert.equal(sensorModel('MS5803_118'), 'MS5803')
    assert.equal(sensorModel('DFR_MultiGas_0'), 'DFR_MultiGas')
    assert.equal(sensorModel('SEN55'), 'SEN55')
  })

  test('display names match Ear2Earth, including the SEN55 case fix', () => {
    assert.equal(sensorDisplayName('Teros10'), 'Soil Moisture')
    assert.equal(sensorDisplayName('MS5803_118'), 'Atmospheric')
    assert.equal(sensorDisplayName('SHT31_2'), 'Climate_2')
    assert.equal(sensorDisplayName('SEN55'), 'Air Quality Index')
    assert.equal(sensorDisplayName('BrandNewSensor'), 'BrandNewSensor')
  })
})

/* ---------- Full conversion of one packet ---------- */

describe('toReadings', () => {
  const readingsA = toReadings('A', stationA)
  const readingsB = toReadings('B', stationB)

  test('one row per sensor field (2 Analog + 8 SEN55 + 2 SHT31)', () => {
    assert.equal(readingsA.length, 12)
  })

  test('produces the full reading model for one field', () => {
    assert.deepEqual(reading(readingsA, 'Humidity_%RH'), {
      stationId: 'A',
      sensor: 'SHT31',
      sensorName: 'Climate',
      model: 'SHT31',
      variable: 'Humidity',
      field: 'Humidity_%RH',
      value: 71.34999847,
      unit: '%RH',
      unitSource: 'name',
      timestamp: '2026-08-19T09:34:48.000Z',
      quality: 'ok',
    })
  })

  test('reads units from field names', () => {
    assert.equal(reading(readingsA, 'Temperature_C').unit, '°C') // alias C → °C
    assert.equal(reading(readingsA, 'PM2_5_µg/m³').variable, 'PM2_5') // splits on LAST underscore
    assert.equal(reading(readingsA, 'PM2_5_µg/m³').unit, 'µg/m³')
  })

  test('uses the lookup table where the suffix is not a unit', () => {
    assert.equal(reading(readingsA, 'VocIndex_0-500').unit, 'index (0-500)')
    assert.equal(reading(readingsA, 'Vbat_MV').unit, 'mV')
    assert.equal(reading(readingsA, 'Vbat').unitSource, 'table')
  })

  test('keeps two sensors of the same model separate', () => {
    const pressure = readingsB.filter((r) => r.model === 'MS5803')
    assert.deepEqual(pressure.map((r) => r.sensorName), ['Atmospheric', 'Hydrostatic'])
  })

  test('flags missing and invalid values instead of dropping or plotting them', () => {
    const hydro = readingsB.find((r) => r.sensor === 'MS5803_119')
    assert.equal(hydro.quality, 'missing')
    assert.equal(hydro.value, null)

    const soil = readingsB.find((r) => r.sensor === 'Teros10')
    assert.equal(soil.quality, 'invalid')
    assert.equal(soil.value, null)
    assert.equal(soil.unitSource, 'none') // no unit in the name: ask the lab
  })

  test('a packet without a usable timestamp produces no readings', () => {
    assert.deepEqual(toReadings('A', { SHT31: { Temperature_C: 20 } }), [])
    assert.deepEqual(toReadings('A', { Timestamp: { time_utc: 'bad' }, SHT31: { Temperature_C: 20 } }), [])
  })

  test('does not crash on an empty or missing document', () => {
    assert.deepEqual(toReadings('A', {}), [])
    assert.deepEqual(toReadings('A', null), [])
  })
})

/* ---------- Sensor list and metadata ---------- */

describe('summarizeSensors', () => {
  test('keeps the newest value for each field across packets', () => {
    const older = { ...stationA, Timestamp: { time_utc: '2026-08-19T8:00:00Z' }, SHT31: { Temperature_C: 1 } }
    const list = summarizeSensors([...toReadings('A', stationA), ...toReadings('A', older)])
    const temp = list.find((s) => s.field === 'Temperature_C')
    assert.equal(temp.lastValue, 25.53000069)
    assert.equal(temp.lastSeen, '2026-08-19T09:34:48.000Z')
  })

  test('lists each field once', () => {
    const list = summarizeSensors([...toReadings('A', stationA), ...toReadings('A', stationA)])
    assert.equal(list.length, 12)
  })
})

describe('toMetadata', () => {
  test('converts string coordinates to numbers and renames fields', () => {
    const meta = toMetadata('A', {
      Type: 'metadata',
      deployment_date: '2026-06-01',
      latitude: '44.56',
      longitude: '-123.28',
      owner: 'OPEnS Lab',
    })
    assert.deepEqual(meta, {
      stationId: 'A',
      deploymentDate: '2026-06-01',
      latitude: 44.56,
      longitude: -123.28,
      owner: 'OPEnS Lab',
    })
  })

  test('missing or bad fields become null', () => {
    const meta = toMetadata('A', { latitude: 'not a number' })
    assert.equal(meta.latitude, null)
    assert.equal(meta.longitude, null)
    assert.equal(meta.owner, null)
  })
})
