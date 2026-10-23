import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createWorker } from '../worker/index.js'

const origin = 'https://devday-community-studio-ec.israelgo93.chatgpt.site'
const imagePath = '/assets/devday-studio-social-v1.png'
const assets = {}
for (const [path, file, type] of [
  ['/index.html', '../index.html', 'text/html'],
  ['/welcome-es.html', '../public/welcome-es.html', 'text/html'],
  ['/welcome-en.html', '../public/welcome-en.html', 'text/html'],
  [imagePath, `../public${imagePath}`, 'image/png'],
]) assets[path] = { type, data: (await readFile(new URL(file, import.meta.url))).toString('base64') }
const worker = createWorker(assets)
const request = (path, headers = {}, method = 'GET') => new Request(`${origin}${path}`, { headers, method })
const meta = (html, name) => [...html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g)].find(match => match[1] === name)?.[2]

test('the shared root provides the same public metadata to people and crawlers without redirects', async () => {
  const response = await worker.fetch(request('/'))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('location'), null)
  const html = await response.text()
  assert.equal(meta(html, 'og:url'), `${origin}/`)
  assert.equal(meta(html, 'og:image'), `${origin}${imagePath}`)
  assert.match(html, /Continuar con ChatGPT/)
  assert.ok(!html.includes('id="devday-session"'))
  for (const userAgent of ['Twitterbot/1.0', 'facebookexternalhit/1.1']) {
    assert.equal(await (await worker.fetch(request('/', { 'User-Agent': userAgent }))).text(), html)
  }
  const head = await worker.fetch(request('/', {}, 'HEAD'))
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  assert.equal((await worker.fetch(request('/api/session'))).status, 401)
})

test('Spanish and English metadata have canonical links, large cards and descriptive image text', async () => {
  for (const lang of ['es', 'en']) {
    for (const path of [`/?lang=${lang}`, `/welcome?lang=${lang}`]) {
      const response = await worker.fetch(request(path))
      const html = await response.text()
      const canonical = `${origin}/${lang === 'en' ? '?lang=en' : ''}`
      assert.equal(meta(html, 'og:url'), canonical)
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`))
      assert.equal(meta(html, 'og:locale'), lang === 'en' ? 'en_US' : 'es_EC')
      assert.equal(meta(html, 'og:type'), 'website')
      assert.equal(meta(html, 'og:site_name'), 'DevDay Studio')
      assert.match(meta(html, 'og:title'), /DevDay Studio/)
      assert.equal(meta(html, 'description'), meta(html, 'og:description'))
      assert.equal(meta(html, 'twitter:card'), 'summary_large_image')
      assert.equal(meta(html, 'twitter:image'), meta(html, 'og:image'))
      assert.ok(meta(html, 'og:image:alt').length > 30)
      assert.equal(meta(html, 'twitter:image:alt'), meta(html, 'og:image:alt'))
      assert.equal(meta(html, 'og:image:width'), '1200')
      assert.equal(meta(html, 'og:image:height'), '630')
      assert.equal(meta(html, 'og:image:type'), 'image/png')
      assert.match(response.headers.get('vary'), /Accept-Language/)
    }
  }
  const browserDefault = await worker.fetch(request('/', { 'Accept-Language': 'en-US,en;q=0.9' }))
  assert.equal(meta(await browserDefault.text(), 'og:locale'), 'en_US')
})

test('the social image is a lightweight 1200 by 630 PNG and is publicly fetchable', async () => {
  const response = await worker.fetch(request(imagePath))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'image/png')
  assert.match(response.headers.get('cache-control'), /public/)
  const png = Buffer.from(await response.arrayBuffer())
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
  assert.ok(png.length < 300_000)
  const head = await worker.fetch(request(imagePath, {}, 'HEAD'))
  assert.equal(head.status, 200)
  assert.equal(head.headers.get('content-type'), 'image/png')
  assert.equal(await head.text(), '')
})
