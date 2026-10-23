import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createWorker } from '../worker/index.js'

const asset = (text, type = 'text/html') => ({ type, data: Buffer.from(text).toString('base64') })
const worker = createWorker({ '/index.html': asset('<html><head></head><body>EDITOR</body></html>'), '/welcome-es.html': asset('CONTINUAR'), '/welcome-en.html': asset('CONTINUE'), '/assets/app.js': asset('APP', 'text/javascript') })
const signed = { 'oai-authenticated-user-id': 'visitor-a', 'oai-authenticated-user-email': 'visitor@example.test' }
const request = (path, headers = {}, method = 'GET') => new Request(`https://studio.example${path}`, { headers, method })

test('anonymous visitors cannot load the editor or session', async () => {
  for (const path of ['/', '/index.html']) {
    const response = await worker.fetch(request(path))
    assert.equal(response.status, 303); assert.equal(response.headers.get('location'), '/welcome')
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
  assert.equal((await worker.fetch(request('/api/session'))).status, 401)
})
test('partial identity does not grant access', async () => {
  assert.equal((await worker.fetch(request('/', { 'oai-authenticated-user-id': 'visitor-a' }))).status, 303)
})
test('any authenticated visitor can enter and gets an uncached identity', async () => {
  const response = await worker.fetch(request('/', signed))
  assert.equal(response.status, 200)
  assert.match(await response.text(), /devday-session/)
  assert.match(response.headers.get('cache-control'), /private, no-store/)
  const session = await worker.fetch(request('/api/session', signed))
  assert.equal((await session.json()).user.id, 'visitor-a')
})
test('display names cannot inject scripts into the editor', async () => {
  const response = await worker.fetch(request('/', { ...signed, 'oai-authenticated-user-full-name': encodeURIComponent('</script><script>alert(1)</script>'), 'oai-authenticated-user-full-name-encoding': 'percent-encoded-utf-8' }))
  const html = await response.text()
  assert.ok(!html.includes('</script><script>alert'))
  assert.ok(html.includes('\\u003c/script>'))
})
test('welcome is bilingual and signed-out return does not auto-redirect', async () => {
  assert.equal(await (await worker.fetch(request('/welcome?lang=en'))).text(), 'CONTINUE')
  assert.equal(await (await worker.fetch(request('/welcome?lang=es'))).text(), 'CONTINUAR')
  assert.equal((await worker.fetch(request('/welcome', signed))).status, 303)
  assert.equal((await worker.fetch(request('/welcome?signed_out=1', signed))).status, 200)
})
test('only public visual assets are served anonymously', async () => {
  assert.equal((await worker.fetch(request('/assets/app.js'))).status, 200)
  assert.equal((await worker.fetch(request('/welcome-en.html'))).status, 404)
  assert.equal((await worker.fetch(request('/unknown'))).status, 404)
  assert.equal((await worker.fetch(request('/', {}, 'POST'))).status, 405)
})
test('Sites owns the authentication routes', async () => {
  for (const path of ['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback']) assert.equal((await worker.fetch(request(path))).status, 404)
})
