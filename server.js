import http from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(root, 'data')
const dbFile = path.join(dataDir, 'rsvps.json')
const port = Number(process.env.API_PORT || process.env.PORT || 3001)
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' }

async function readRecords() {
  try { return JSON.parse(await readFile(dbFile, 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dataDir, { recursive: true })
    await writeFile(dbFile, '[]', 'utf8')
    return []
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200); res.end(JSON.stringify({ ok: true, storage: 'file-database' })); return
  }
  if (req.url === '/api/rsvps' && req.method === 'POST') {
    try {
      let body = ''
      for await (const chunk of req) {
        body += chunk
        if (body.length > 100_000) { res.writeHead(413); res.end(JSON.stringify({ error: 'Request too large' })); return }
      }
      const input = JSON.parse(body || '{}')
      if (!String(input.name || '').trim()) { res.writeHead(400); res.end(JSON.stringify({ error: 'Name is required' })); return }
      const record = {
        id: randomUUID(),
        name: String(input.name).trim().slice(0, 160),
        attendance: String(input.attendance || 'yes').slice(0, 80),
        count: Math.max(1, Math.min(20, Number(input.count) || 1)),
        note: String(input.note || '').slice(0, 2000),
        food: String(input.food || '').slice(0, 80),
        transport: String(input.transport || '').slice(0, 80),
        music: String(input.music || '').slice(0, 80),
        children: String(input.children || '').slice(0, 40),
        wishes: String(input.wishes || '').slice(0, 2000),
        event: String(input.event || '').slice(0, 200),
        createdAt: new Date().toISOString(),
      }
      const records = await readRecords()
      records.unshift(record)
      await writeFile(dbFile, JSON.stringify(records, null, 2), 'utf8')
      res.writeHead(201); res.end(JSON.stringify({ ok: true, id: record.id })); return
    } catch {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid request' })); return
    }
  }
  if (req.url === '/api/rsvps' && req.method === 'GET') {
    const records = await readRecords()
    res.writeHead(200); res.end(JSON.stringify({ count: records.length })); return
  }
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    try {
      const dist = path.join(root, 'dist')
      const requested = decodeURIComponent((req.url || '/').split('?')[0])
      const candidate = path.resolve(dist, `.${requested}`)
      const safe = candidate.startsWith(dist + path.sep) || candidate === path.join(dist, 'index.html')
      const target = safe ? candidate : path.join(dist, 'index.html')
      let filePath = target
      try { await stat(filePath) } catch { filePath = path.join(dist, 'index.html') }
      const contents = await readFile(filePath)
      res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' }); res.end(contents); return
    } catch { res.writeHead(503); res.end(JSON.stringify({ error: 'Site is not built yet. Run npm run build first.' })); return }
  }
  res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(port, '0.0.0.0', () => console.log(`NIKOH API listening on http://localhost:${port}`))
