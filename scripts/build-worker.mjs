import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { extname } from 'node:path'

const root = new URL('../', import.meta.url)
const dist = new URL('dist/', root)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.otf': 'font/otf', '.json': 'application/json' }
const assets = {}
async function collect(path = '') {
  for (const entry of await readdir(new URL(path, dist), { withFileTypes: true })) {
    if (entry.name === 'server' || entry.name === '.openai' || entry.name.endsWith('.provenance.json')) continue
    const relative = `${path}${entry.name}`
    if (entry.isDirectory()) await collect(`${relative}/`)
    else assets[`/${relative}`] = { type: types[extname(entry.name)] || 'application/octet-stream', data: (await readFile(new URL(relative, dist))).toString('base64') }
  }
}
await collect()
const source = (await readFile(new URL('worker/index.js', root), 'utf8')).replace(/^export function /gm, 'function ')
const worker = `${source}\nexport default createWorker(${JSON.stringify(assets)});\n`
await mkdir(new URL('server/', dist), { recursive: true })
await mkdir(new URL('.openai/', dist), { recursive: true })
await writeFile(new URL('server/index.js', dist), worker)
await writeFile(new URL('.openai/hosting.json', dist), await readFile(new URL('.openai/hosting.json', root)))
const module = await import(`data:text/javascript;base64,${Buffer.from(worker).toString('base64')}`)
if (typeof module.default?.fetch !== 'function') throw new Error('Worker must export default.fetch')
console.log(`Sites Worker: ${Object.keys(assets).length} resources embedded; ${(Buffer.byteLength(worker) / 1024 / 1024).toFixed(2)} MiB. Authentication gate included.`)
