# Deployment

## Develop without hosting

`npm ci && npm run dev` opens the editor directly. No secrets or environment variables are required. Development mode intentionally has no login gate.

For the built hosted flow, run `npm run build`, then `npm run preview:auth -- --mock-auth`. The simulator listens only on 127.0.0.1 and uses a fake identity. Without `--mock-auth`, it serves the anonymous welcome experience.

`npm run preview` serves Vite's static output and therefore bypasses the Worker's authentication logic. Use it only as a local static preview.

## Deploy a separate Site

The checked-in manifest identifies the existing public demo. It is not an authentication secret; it must not be reused as the identity of a fork.

1. Register a **new Site** using your own Sites account/integration.
2. Set `project_id` in `.openai/hosting.json` to the identifier returned for that Site. Keep Worker hosting; this project does not use a static hosting declaration.
3. Replace the demo origin in `index.html`, `public/welcome-es.html`, `public/welcome-en.html` and `scripts/social.test.mjs`. Update the project links in package metadata and documentation as appropriate.
4. Review the supplied event presets, photos, fonts and brand materials for your deployment. See [asset provenance](../ASSETS.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).
5. Run `npm ci`, `npm test` and `npm run build`.
6. Use Sites' source/version/publish workflow to publish the exact built revision. The artifact has `server/index.js` and `.openai/hosting.json` under `dist/`; a static-only upload will not provide this login flow.
7. Configure the Site's audience for your intended visitors and test anonymous entry, real ChatGPT sign-in, sign-out and exports at the final URL.

GitHub Actions only validates the code. It has no automatic production deployment and needs no Site secrets.

## Authentication boundary

Sites verifies the session and supplies `oai-authenticated-user-id`, `oai-authenticated-user-email` and optional encoded name headers. Only the Sites gateway is trusted to provide those headers. It also owns sign-in, callback and sign-out routes.

**Do not deploy this Worker unchanged behind a generic HTTP server that accepts those headers from visitors.** In that environment, the headers would be forgeable. Implement server-side session/token verification and strip untrusted identity headers before passing a verified identity to the application.

A static copy can run the browser editor, but it does not reproduce ChatGPT sign-in, the access gate or hosted account identity. Static hosting is not the documented authenticated deployment.

| Route | Expected behavior |
| --- | --- |
| `/`, `/index.html` | Anonymous: welcome HTML; verified visitor: editor HTML. |
| `/welcome?lang=es` or `en` | Localized welcome; signed-in visitors return to the editor unless signing out. |
| `/api/session` | 200 with verified identity, otherwise 401. Never publicly cached. |
| `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback` | Handled by Sites upstream. |
| Allowed assets/fonts | Public, so the welcome page and link previews work anonymously. |

No database, OAuth client secret, OpenAI API key or Supabase project is configured in this codebase.

## Social previews

Public HTML contains Open Graph, Twitter Card, canonical URLs and language alternatives. The shared image is `/assets/devday-studio-social-v1.png`, a 1200 × 630 PNG of about 65 KB.

To change it, run Vite and open `/design/social-card.html`. Edit `src/social-card.ts`, wait for `canvas[data-ready="true"]`, then capture the canvas at native CSS size. Save a versioned filename and update the three HTML heads and the social tests. The source design page is not part of the production app bundle.

Verify the public page and image without cookies, including GET and HEAD. Social platforms can cache old previews; deploying does not rewrite existing shared messages.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No ChatGPT login locally | Expected in Vite mode. Use the local mock for development or a configured Site for real authentication. |
| New device has no drafts | Storage is local to the browser/origin. Import a saved JSON backup. |
| MP4 unavailable | Browser codec support differs; use the offered WebM or GIF. |
| Video timing is uneven | Keep the tab visible; reduce competing browser/device work. |
| Welcome works but editor does not open on a fork | Check Site audience, gateway authentication and the fork's own Site identity. |
| Link preview has no image | Check the absolute image URL, anonymous HTTP response and platform cache. |
