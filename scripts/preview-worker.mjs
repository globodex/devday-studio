// Loopback-only preview of the built Worker. Mock sign-in exists only in this script.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8')
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const mock = process.argv.includes('--mock-auth')
let signedIn = false
const port = Number(process.env.PORT || 4173)
createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url || '/', `http://127.0.0.1:${port}`)
    if (mock && ['/signin-with-chatgpt', '/signout-with-chatgpt'].includes(url.pathname)) {
      signedIn = url.pathname === '/signin-with-chatgpt'
      const returnTo = url.searchParams.get('return_to') || '/'
      outgoing.writeHead(303, { Location: returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/' }); outgoing.end(); return
    }
    const headers = new Headers()
    if (incoming.headers['accept-language']) headers.set('accept-language', incoming.headers['accept-language'])
    if (mock && signedIn) {
      headers.set('oai-authenticated-user-id', 'local-preview')
      headers.set('oai-authenticated-user-email', 'preview@sites.test')
      headers.set('oai-authenticated-user-full-name', 'Local%20preview')
      headers.set('oai-authenticated-user-full-name-encoding', 'percent-encoded-utf-8')
    }
    const response = await worker.fetch(new Request(url, { method: incoming.method, headers }))
    outgoing.writeHead(response.status, Object.fromEntries(response.headers))
    outgoing.end(Buffer.from(await response.arrayBuffer()))
  } catch { outgoing.writeHead(500); outgoing.end('Preview failed') }
}).listen(port, '127.0.0.1', () => console.log(`Local Worker preview: http://127.0.0.1:${port}/ (${mock ? 'simulated identity, local only' : 'anonymous'})`))
