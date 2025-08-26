import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
// Prefer env PORT from Webuzo; only fall back if you truly want a default.
const port = Number(process.env.PORT) || 30004

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Bind to IPv4 to avoid the ::: (IPv6) ambiguity
  server.listen(port, '0.0.0.0', () => {
    console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`)
  })

  // Graceful shutdown so the port frees cleanly
  const shutdown = () => {
    console.log('Shutting down...')
    server.close(() => process.exit(0))
    // Fallback hard-exit after 5s
    setTimeout(() => process.exit(0), 5000)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or change PORT.`)
    } else {
      console.error(err)
    }
    process.exit(1)
  })
})
