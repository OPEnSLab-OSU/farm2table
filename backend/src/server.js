/***************************************************************
 * Farm2Table API server.
 * Startup order: connect to MongoDB → ping → start listening.
 * If the database is unreachable the server exits 
 ***************************************************************/
import express from 'express'
import { connect, close, ping } from './db/client.js'
import stationsRouter from './routes/stations.js'

const port = Number(process.env.PORT) || 3000

const app = express()
app.disable('x-powered-by') // don't advertise Express in response headers

// GET /api/health  → is the API up and can it reach MongoDB?
app.get('/api/health', async (req, res) => {
  try {
    await ping()
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'db_unreachable' })
  }
})

app.use('/api/stations', stationsRouter)

// Unknown /api route → JSON 404 (instead of Express's HTML page)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Log the real error on the server; never send it to the browser
app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) return next(err)
  const status = err instanceof TypeError ? 400 : 500 // TypeError = bad input caught in db/stations.js
  res.status(status).json({ error: status === 400 ? err.message : 'Internal server error' })
})

const start = async () => {
  try {
    await connect()
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message)
    process.exit(1)
  }

  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
  })

  server.on('error', async (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${port} is already in use` : err)
    await close()
    process.exit(1)
  })

  // Ctrl+C locally, or the VPS stopping the service: finish requests, then close MongoDB
  const shutdown = () => {
    console.log('Shutting down...')
    server.close(async () => {
      await close()
      process.exit(0)
    })
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start()
