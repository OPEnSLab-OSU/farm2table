/***************************************************************
 * HTTP endpoints for stations. This file handles the request side:
 * reading and validating query params and picking status codes.
 * All database work happens in db/stations.js.
 ***************************************************************/
import { Router } from 'express'
import {
  listStations,
  getDateRange,
  getReadings,
  getLatest,
  getSensors,
  getMetadata,
} from '../db/stations.js'

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000 // one year (covers a full season)
const MAX_LATEST = 5000
const STATION_CACHE_MS = 60 * 1000

const router = Router()

// The station list rarely changes, so cache it instead of calling
// listCollections on every request.
let stationCache = { names: [], expires: 0 }

const knownStations = async () => {
  if (Date.now() < stationCache.expires) return stationCache.names
  const names = await listStations()
  stationCache = { names, expires: Date.now() + STATION_CACHE_MS }
  return names
}

const parseDate = (s) => {
  if (typeof s !== 'string' || s === '') return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

const badRequest = (res, error) => res.status(400).json({ error })

// Only accept IDs that are real collections. User text never goes straight into db.collection().
router.param('id', async (req, res, next, id) => {
  try {
    const stations = await knownStations()
    if (!stations.includes(id)) return res.status(404).json({ error: 'Unknown station' })
    next()
  } catch (err) {
    next(err)
  }
})

// GET /api/stations  → ['StationA', 'StationB', ...]
router.get('/', async (req, res) => {
  res.json(await knownStations())
})

// GET /api/stations/:id/range  → { start, end } or null if the station has no readings
router.get('/:id/range', async (req, res) => {
  res.json(await getDateRange(req.params.id))
})

// GET /api/stations/:id/sensors  → sensors on THIS station with their latest values
router.get('/:id/sensors', async (req, res) => {
  res.json(await getSensors(req.params.id))
})

// GET /api/stations/:id/metadata  → deployment date, location, owner
router.get('/:id/metadata', async (req, res) => {
  const meta = await getMetadata(req.params.id)
  if (!meta) return res.status(404).json({ error: 'No metadata for this station' })
  res.json(meta)
})

// GET /api/stations/:id/readings?latest=100
// GET /api/stations/:id/readings?start=2026-10-01T00:00:00Z&end=2026-10-08T00:00:00Z
// Optional &sensor=SHT31 to return only that sensor
router.get('/:id/readings', async (req, res) => {
  const { start, end, latest, sensor } = req.query

  if (sensor !== undefined) {
    const sensors = await getSensors(req.params.id)
    if (!sensors.some((s) => s.sensor === sensor)) {
      return res.status(404).json({ error: 'This station has no such sensor' })
    }
  }

  if (latest !== undefined) {
    const n = Number(latest)
    if (!Number.isInteger(n) || n < 1 || n > MAX_LATEST) {
      return badRequest(res, `latest must be an integer from 1 to ${MAX_LATEST}`)
    }
    return res.json(await getLatest(req.params.id, n, { sensor }))
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)
  if (!startDate || !endDate) {
    return badRequest(res, 'Provide latest=N, or start and end as ISO dates')
  }
  if (endDate <= startDate) return badRequest(res, 'end must be after start')
  if (endDate - startDate > MAX_RANGE_MS) return badRequest(res, 'range cannot exceed one year')

  res.json(await getReadings(req.params.id, startDate, endDate, { sensor }))
})

export default router
