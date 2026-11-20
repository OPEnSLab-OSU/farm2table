/***************************************************************
 * MongoDB queries for sensor stations (adapted from Ear2Earth server.js).
 * Each collection in the database is one station.
 * Returns Farm2Table's reading model via translate.js, never raw documents.
 ***************************************************************/
import { getDb } from './client.js'
import {
  toReadings,
  toMetadata,
  summarizeSensors,
  latestToSummary,
  NON_SENSOR_KEYS,
} from './translate.js'

// Device and radio info we never send to the frontend
const HIDDEN_FIELDS = { Packet: 0, WiFi: 0, LTE: 0, LoRa: 0, Bringup: 0 }

// How many recent packets to scan when building a station's sensor list
// const SENSOR_SAMPLE_SIZE = 100 //todo This can be changed or maybe use a different system

// Metadata documents may be spelled Type or type (Ear2Earth used lowercase).
// Matching both is harmless until the lab confirms which one is real.
const IS_METADATA = { $or: [{ Type: 'metadata' }, { type: 'metadata' }] }
const IS_NOT_METADATA = { Type: { $ne: 'metadata' }, type: { $ne: 'metadata' } }

// Turns the time_utc string into a real Date inside MongoDB so we can filter and sort by it.
// Bad or missing timestamps become null and are skipped (same as Ear2Earth /date-range).
const parsedTime = {
  $dateFromString: { dateString: '$Timestamp.time_utc', onError: null, onNull: null },
}

const collection = (stationId) => getDb().collection(stationId)

const byTimestamp = (a, b) => a.timestamp.localeCompare(b.timestamp)

// Routes already check the sensor against the station's real sensor list;
// this is a second guard so a field path like 'a.b' or '$x' can never reach MongoDB.
const assertSafeSensor = (sensor) => {
  if (sensor !== undefined && (typeof sensor !== 'string' || sensor === '' || /[.$]/.test(sensor))) {
    throw new TypeError(`Invalid sensor name: ${sensor}`)
  }
}

// Fetch every sensor, or only one sensor's object (much less data for a single chart)
const projectionFor = (sensor) =>
  sensor ? { _id: 0, Timestamp: 1, [sensor]: 1 } : HIDDEN_FIELDS

// Ear2Earth /collections
export const listStations = async () => {
  const cols = await getDb()
    .listCollections({ type: 'collection' }, { nameOnly: true })
    .toArray()
  return cols
    .map((c) => c.name)
    .filter((name) => !name.startsWith('system.'))
    .sort()
}

// Ear2Earth /date-range: earliest and latest reading for one station
export const getDateRange = async (stationId) => {
  const [doc] = await collection(stationId)
    .aggregate([
      { $project: { t: parsedTime } },
      { $match: { t: { $ne: null } } },
      { $group: { _id: null, start: { $min: '$t' }, end: { $max: '$t' } } },
    ])
    .toArray()

  return doc ? { start: doc.start.toISOString(), end: doc.end.toISOString() } : null
}

// Ear2Earth /data?startTime=&endTime=  (start inclusive, end exclusive, both UTC Dates)
export const getReadings = async (stationId, start, end, { sensor } = {}) => {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    throw new TypeError('start and end must be Date objects')
  }
  assertSafeSensor(sensor)

  const docs = await collection(stationId)
    .aggregate([
      { $addFields: { _t: parsedTime } },
      { $match: { _t: { $gte: start, $lt: end } } },
      { $sort: { _t: 1 } }, // ascending, so no reverse() needed
      { $project: sensor ? projectionFor(sensor) : { _t: 0, ...HIDDEN_FIELDS } },
    ])
    .toArray()

  return docs.flatMap((doc) => toReadings(stationId, doc))
}

// Ear2Earth /data?x=  : the last n packets
// Sorted by _id, not by the timestamp string: unpadded hours make strings sort wrong
// ('T9:..' comes after 'T23:..'). An ObjectId contains its insert time, so it sorts correctly.
export const getLatest = async (stationId, n, { sensor } = {}) => {
  assertSafeSensor(sensor)

  const docs = await collection(stationId)
    .find(IS_NOT_METADATA, { projection: projectionFor(sensor) })
    .sort({ _id: -1 })
    .limit(n)
    .toArray()

  // Insert order is close to measurement order but not guaranteed, so sort by real time
  return docs.flatMap((doc) => toReadings(stationId, doc)).sort(byTimestamp)
}

// Which sensors does THIS station have? Built from its recent packets,
// so a new sensor on any station appears automatically, with no config file.
// Discover all sensors throughout the station's recording history.
export const getSensors = async (stationId) => {
  const cursor = collection(stationId)
    .find(IS_NOT_METADATA, { projection: HIDDEN_FIELDS })

  const sensors = new Map()

  for await (const doc of cursor) {
    for (const reading of toReadings(stationId, doc)) {
      const key = JSON.stringify([reading.sensor, reading.field])
      const previous = sensors.get(key)

      if (!previous || reading.timestamp > previous.timestamp) {
        sensors.set(key, reading)
      }
    }
  }

  return summarizeSensors([...sensors.values()])
}

// Same result as getSensors, but MongoDB does the work: it finds the newest
// value of every sensor field and returns one row per field, instead of
// streaming the station's whole history into Node.
export const getLatestValues = async (stationId) => {
  const rows = await collection(stationId)
    .aggregate([
      { $match: IS_NOT_METADATA },
      { $sort: { _id: -1 } }, // newest first (see getLatest for why _id, not the timestamp string)
      { $project: { _id: 0, t: '$Timestamp.time_utc', kv: { $objectToArray: '$$ROOT' } } },
      { $unwind: '$kv' }, // one row per top-level key
      { $match: { 'kv.k': { $nin: [...NON_SENSOR_KEYS] }, 'kv.v': { $type: 'object' } } }, // sensors only
      { $project: { t: 1, sensor: '$kv.k', f: { $objectToArray: '$kv.v' } } },
      { $unwind: '$f' }, // one row per sensor field
      {
        $group: {
          _id: { sensor: '$sensor', field: '$f.k' },
          value: { $first: '$f.v' }, // first = newest, because of the sort above
          time_utc: { $first: '$t' },
        },
      },
    ], { allowDiskUse: true })
    .toArray()

  return latestToSummary(stationId, rows)
}

// Ear2Earth /metadata, but only THIS station's collection
// (Ear2Earth searched every collection and returned the first match)
export const getMetadata = async (stationId) => {
  const doc = await collection(stationId).findOne(IS_METADATA)
  return doc ? toMetadata(stationId, doc) : null
}
