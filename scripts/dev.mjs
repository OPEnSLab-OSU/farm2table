/***************************************************************
 * Local dev launcher: `npm run dev` from the repo root.
 * Starts the backend, waits until /api/health answers, then
 * starts the Vite frontend. Ctrl+C (or either process dying)
 * stops both.
 ***************************************************************/
'use strict'
import { spawn } from 'node:child_process'

const API_PORT = Number(process.env.PORT) || 3000
const HEALTH_URL = `http://localhost:${API_PORT}/api/health`
const TIMEOUT_MS = 30_000

const children = []
let shuttingDown = false

const run = (name, workspace) => {
  const child = spawn('npm', ['run', 'dev', '-w', workspace], {
    stdio: 'inherit',
    shell: true, // needed on Windows to resolve npm.cmd
  })
  children.push(child)
  child.on('exit', (code) => {
    if (shuttingDown) return
    console.error(`\n[dev] ${name} exited (code ${code}), stopping everything`)
    shutdown(code ?? 1)
  })
  return child
}

const killTree = (child) => {
  if (child.exitCode !== null) return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
  } else {
    child.kill('SIGINT')
  }
}

const shutdown = (code = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  children.forEach(killTree)
  setTimeout(() => process.exit(code), 500)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Any HTTP response (even 503 db_unreachable) means Express is listening
const waitForBackend = async (deadline) => {
  while (Date.now() < deadline) {
    if (shuttingDown) return false
    try {
      await fetch(HEALTH_URL)
      return true
    } catch {
      await sleep(500)
    }
  }
  return false
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log('[dev] starting backend...')
run('backend', 'backend')

const ready = await waitForBackend(Date.now() + TIMEOUT_MS)
if (!ready) {
  if (!shuttingDown) {
    console.error(`[dev] backend did not respond at ${HEALTH_URL} within ${TIMEOUT_MS / 1000}s`)
    shutdown(1)
  }
} else {
  console.log('[dev] backend is up, starting frontend...')
  run('frontend', 'frontend')
}
