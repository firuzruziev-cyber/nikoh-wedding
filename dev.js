import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = path.dirname(fileURLToPath(import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const node = process.execPath
const api = spawn(node, [path.join(root, 'server.js')], { cwd: root, stdio: 'inherit' })
const vite = spawn(npm, ['exec', '--', 'vite', '--host', '0.0.0.0'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
function stop() { api.kill(); vite.kill(); process.exit() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
api.on('exit', (code) => { if (code && code !== 0) { vite.kill(); process.exit(code) } })
vite.on('exit', (code) => { api.kill(); process.exit(code ?? 0) })
