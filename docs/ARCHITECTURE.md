# Architecture

## Rendering and data flow

~~~text
Event/form edits → typed Design state → Preview → renderDesign(Canvas 2D)
                                           └──→ export → PNG / JPG / GIF / video

Design + events → debounced localStorage → restored in the same browser
                └──→ explicit JSON backup / import
~~~

`src/model.ts` defines event/design types, editable presets, validation, formats and migration. `src/App.tsx` owns the editor workflow. `src/EventEditor.tsx` handles event creation and editing. The event list and the currently edited promotion are separate: use the save-to-event action to apply promotion fields back to an event.

`src/render.ts` draws the composition, photos, type and agents. `src/motion.ts` supplies deterministic poses for a normalized loop progress. `src/Preview.tsx` animates that renderer. Export uses the same renderer to avoid preview/download differences.

## Exports

`src/export.ts` creates PNG/JPG blobs or records the canvas using MediaRecorder. `src/gif.worker.ts` uses gifenc outside the UI thread. GIFs alternate 80/90 ms frame delays to retain the intended total duration at approximately 12 fps.

Video support is browser-dependent. The implementation chooses a supported MP4/WebM MIME type; it does not transcode on a server. Browser throttling can change effective video timing.

## Language

`src/i18n.ts` contains typed ES/EN interface strings and the language preference. Artwork language is stored in the design separately and controls automatic dates/text. User-entered titles and names remain unchanged.

## Persistence and identity

The editor saves to localStorage with a 450 ms debounce. The design and event keys are namespaced by the verified Site account ID. Locale remains a browser preference. `src/session.ts` migrates older unscoped drafts once, to the first signed-in account in that browser.

This is browser-local storage, not remote account storage or encryption. The same account on another device starts with different local data. JSON export/import is the existing way to transfer work.

## Hosted request flow

~~~text
Browser → Sites gateway (session verification)
        → Worker (trusted identity headers)
           ├─ anonymous / → public welcome HTML + social metadata
           ├─ authenticated / → editor HTML + escaped session JSON
           ├─ /api/session → 200 with identity, or 401
           └─ allowed visual assets → public response
~~~

The gateway owns `/signin-with-chatgpt`, `/signout-with-chatgpt` and `/callback`. The Worker consumes identity; it does not validate OAuth tokens itself. See [Deployment](DEPLOYMENT.md) before porting this boundary to another host.

Identity-bearing HTML and session responses use `private, no-store`. Public images use cacheable versioned paths. Session JSON escapes less-than characters before HTML injection. The client rechecks its session on tab/history restoration.

## Source map

| Area | Files |
| --- | --- |
| Editor | `src/App.tsx`, `src/styles.css`, `src/EventEditor.tsx` |
| Domain | `src/model.ts`, `src/motion.ts` |
| Rendering/export | `src/render.ts`, `src/Preview.tsx`, `src/export.ts`, `src/gif.worker.ts` |
| Language/account | `src/i18n.ts`, `src/AccountMenu.tsx`, `src/session.ts` |
| Public entry | `public/welcome-es.html`, `public/welcome-en.html`, `public/welcome.css` |
| Runtime/build | `worker/index.js`, `scripts/build-worker.mjs`, `.openai/hosting.json` |
| Local auth simulator | `scripts/preview-worker.mjs` |
| Tests | `scripts/check-model.mjs`, `scripts/auth.test.mjs`, `scripts/social.test.mjs` |
| Social artwork | `design/social-card.html`, `src/social-card.ts` |

## Build and test boundaries

`npm run build` runs TypeScript and Vite, then embeds the built files as base64 in a Worker ESM module. Provenance sidecars are excluded from that runtime bundle. Source and lockfile are tracked; build output, node_modules and local test output are ignored.

The suite covers 12 domain/motion/persistence cases, seven access/identity cases and three social preview cases. It does not automate real ChatGPT OAuth, all physical devices or every browser's MediaRecorder implementation.
