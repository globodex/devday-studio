// Sites dispatch owns authentication, cookies and the reserved sign-in/out routes.
// This Worker only consumes the identity headers supplied by that platform.
export function getIdentity(request) {
  const id = request.headers.get('oai-authenticated-user-id')
  const email = request.headers.get('oai-authenticated-user-email')
  if (!id || !email) return null
  let name = email
  if (request.headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8') {
    try { name = decodeURIComponent(request.headers.get('oai-authenticated-user-full-name') || '') || email } catch { /* Use the verified email. */ }
  }
  return { id, email, name }
}

const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization', 'X-Content-Type-Options': 'nosniff' }
const redirect = (path) => new Response(null, { status: 303, headers: { ...privateHeaders, Location: path } })

function welcomeResponse(request, assets) {
  const url = new URL(request.url)
  const language = url.searchParams.get('lang') || request.headers.get('accept-language') || 'es'
  const page = assets[language.startsWith('en') ? '/welcome-en.html' : '/welcome-es.html']
  return new Response(request.method === 'HEAD' ? null : decodeAsset(page), {
    headers: { ...privateHeaders, Vary: 'Cookie, Authorization, Accept-Language', 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export function createWorker(assets) {
  return {
    async fetch(request) {
      const url = new URL(request.url)
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { ...privateHeaders, Allow: 'GET, HEAD' } })
      const user = getIdentity(request)
      if (url.pathname === '/api/session') return Response.json(user ? { user } : { user: null }, { status: user ? 200 : 401, headers: privateHeaders })
      // These paths are handled upstream. Never impersonate the auth service.
      if (['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(url.pathname)) return new Response('Authentication is handled by Sites.', { status: 404, headers: privateHeaders })
      if (url.pathname === '/welcome') {
        if (user && !url.searchParams.has('signed_out')) return redirect('/')
        return welcomeResponse(request, assets)
      }
      if (url.pathname === '/' || url.pathname === '/index.html') {
        // The same public landing HTML goes to people and link crawlers, without
        // JavaScript or redirects. Only verified visitors receive the editor.
        if (!user) return welcomeResponse(request, assets)
        const html = new TextDecoder().decode(decodeAsset(assets['/index.html']))
        const identity = JSON.stringify(user).replaceAll('<', '\\u003c')
        const body = html.replace('</head>', `<script id="devday-session" type="application/json">${identity}</script></head>`)
        return new Response(request.method === 'HEAD' ? null : body, { headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' } })
      }
      // Only the public visual resources are anonymous; welcome HTML never bypasses the gate.
      const asset = /^(\/assets\/|\/fonts\/|\/favicon\.svg$|\/welcome\.css$)/.test(url.pathname) ? assets[url.pathname] : null
      if (!asset) return new Response('Not found', { status: 404, headers: privateHeaders })
      return new Response(request.method === 'HEAD' ? null : decodeAsset(asset), { headers: { 'Content-Type': asset.type, 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' } })
    },
  }
}

function decodeAsset(asset) {
  const binary = atob(asset.data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
