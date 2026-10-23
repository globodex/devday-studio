# DevDay Studio

[English](README.md) · [Español](README.es.md) · [Try the live app](https://devday-community-studio-ec.israelgo93.chatgpt.site/)

[![CI](https://github.com/globodex/devday-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/globodex/devday-studio/actions/workflows/ci.yml)
[![Code license: MIT](https://img.shields.io/badge/code_license-MIT-green.svg)](LICENSE)

![DevDay Studio — flyers, GIFs and videos with colorful community agents](public/assets/devday-studio-social-v1.png)

Create event flyers, social posts, stories and animated announcements from a live form. Built for DevDay communities, with editable events, expressive agents and English/Spanish interfaces.

A community project maintained under **globodex**, not an official OpenAI product.

## What you can make

- Create, edit and delete events; start from the included Ecuador community presets.
- Choose Community, Speaker or Editorial templates, dark/light backgrounds, colors and a circular photo.
- Design square posts (1080 × 1080), portraits (1080 × 1350), stories (1080 × 1920) and landscape banners (1920 × 1080).
- Animate agents with orbit, bounce, waves, float or expressions; use a still frame when needed.
- Download PNG, JPG, animated GIF or video, and back up editable designs/events as JSON.
- Switch the interface and the artwork language independently between English and Spanish.
- Use native ChatGPT sign-in/sign-out on the hosted Sites deployment.

## Run locally

Requires **Node.js 22 or newer**, npm and a current browser. You do not need an API key, a database or a ChatGPT account for local editor development.

~~~sh
git clone https://github.com/globodex/devday-studio.git
cd devday-studio
npm ci
npm run dev
~~~

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

~~~sh
npm test
npm run build
npm run preview:auth -- --mock-auth
~~~

The last command opens a loopback-only simulation of the hosted login flow at http://127.0.0.1:4173. It uses a fake local identity, not real ChatGPT authentication.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Edit the React app with live reload and no authentication gate. |
| `npm test` | Run the 22 domain, persistence, authentication and social metadata checks. |
| `npm run build` | Check TypeScript, build Vite assets and package the Sites Worker. |
| `npm run preview` | Preview the static Vite build; no hosted authentication. |
| `npm run preview:auth` | Preview the built Worker's public welcome page and access gate. |
| `npm run preview:auth -- --mock-auth` | Simulate sign-in/sign-out locally. |

## Create your first promotion

1. Select a preset or add an event in **Your events**.
2. Pick a template, background and output format.
3. Edit the title, city, date, venue and speaker details; optionally upload a photo.
4. Choose the animation and duration. Pause or scrub to select a still frame.
5. Export an image, GIF or video. Save a JSON backup to continue in another browser.

The hosted app requires a ChatGPT account to enter the editor. **Account → Sign out** leaves the Site. It does not sign you out of every ChatGPT service.

## Export and storage limits

| Output | Behavior |
| --- | --- |
| PNG / JPG | Full selected canvas size; JPG uses 95% quality. |
| GIF | Up to 720 px on the longest edge, 12 fps, looping, encoded in a Web Worker. |
| Video | Full canvas size, target 30 fps / 8 Mbps, no audio. MP4 when supported, otherwise WebM. Keep the tab visible while recording. |
| JSON | Editable design and the complete local event list. Photos can be included. |

Designs and uploaded photos stay in **this browser's localStorage**. Hosted drafts use separate keys per account. There is no cloud sync, shared event database or upload service. Local storage is not encrypted; JSON backups may contain your photos and event details.

The example events are editable snapshots, not a live Luma integration. They use Ecuador time (UTC−5). The Manta preset has conflicting source dates and should be confirmed by its organizer. See the [usage guide](docs/USAGE.es.md).

## Architecture and deployment

React 19 + TypeScript strict + Vite 6 power the editor. Canvas 2D renders both previews and exports; `gifenc` handles GIF encoding and MediaRecorder handles video.

A Worker serves the public welcome page and gates the editor using identity supplied by **Sites**. The built artifact is `dist/server/index.js`; visual assets are embedded in it.

**Cloning the repository does not provision ChatGPT login.** That login depends on Sites' trusted gateway. For another deployment, register your own Site and replace its identity and public URLs; for another hosting platform, implement a verified authentication boundary before using the Worker. See [Deployment](docs/DEPLOYMENT.md).

The included `.openai/hosting.json` identifies the existing demo. It is not a credential and does not grant deployment access.

## Documentation

- [Guía en español](README.es.md)
- [Detailed usage guide (Spanish)](docs/USAGE.es.md)
- [Architecture and code map](docs/ARCHITECTURE.md)
- [Deployment, authentication and social previews](docs/DEPLOYMENT.md)
- [Contributing / Cómo contribuir](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)
- [Asset provenance](ASSETS.md) and [third-party notices](THIRD_PARTY_NOTICES.md)
- [Product scope](PRODUCT.md) and [visual system](DESIGN.md)

## Help improve it

Bug reports, translations, templates, accessibility fixes and export improvements are welcome. [Open an issue](https://github.com/globodex/devday-studio/issues/new/choose) or fork the repository and submit a pull request to `main`.

Potential contribution areas include browser compatibility, keyboard navigation, more reusable event templates and testing of export edge cases. These are suggestions, not promised features. Read [CONTRIBUTING.md](CONTRIBUTING.md) before making a change.

## License

The original application code and documentation are released under the [MIT License](LICENSE). Bundled third-party fonts, brand artwork and photographs are **not** relicensed by it. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). OpenAI and ChatGPT names and marks remain the property of their respective owners.
