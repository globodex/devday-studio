# Contributing / Cómo contribuir

Contributions in English and Spanish are welcome. You do not need access to the production Site to work on the editor.

## Start a change

1. Check existing [issues](https://github.com/globodex/devday-studio/issues) and pull requests. Discuss large changes in an issue first.
2. Fork the repository, clone your fork and create a focused branch from `main`.
3. Run `npm ci` and `npm run dev`.
4. Make the change and update the relevant documentation.
5. Run `npm test` and `npm run build`. Fix errors and warnings; rerun the build after fixing them.
6. Open a pull request to `globodex/devday-studio:main`, explaining the problem, the resulting behavior and how you verified it.

Keep each pull request focused. Add screenshots or a short recording for visual changes, and mention browsers you actually tested. Never include credentials, personal drafts, uploaded photos or generated export files.

## Code conventions

- Preserve TypeScript strict mode. Do not use `any`, `as any`, or disable checks to bypass errors. Use existing interfaces, extend them when necessary, and validate unknown input.
- Handle every discriminated-union or enum case. Use the existing `assertNever` pattern in switch defaults.
- Keep both languages in `src/i18n.ts` in sync. Interface language and artwork language are independent; do not silently translate user-entered text.
- Keep preview and exported artwork on the shared `renderDesign` path.
- Animation changes should preserve loop continuity and respect reduced motion.
- Validate imported JSON, URLs, dates and numeric controls at the boundary.
- Add meaningful regression tests when behavior changes. Do not add tests that merely repeat implementation details.
- Use Spanish, ASCII-only commit subjects, for example `Corregir exportacion de imagenes verticales`.
- Preserve third-party notices. Do not add assets without recording their source and applicable terms.

## What to verify

| Change | Useful checks |
| --- | --- |
| Event model / imports | Valid and invalid input, older saved drafts, empty event lists. |
| Motion / renderer | Loop endpoints, still frame, all four aspect ratios, both themes. |
| Export | Actual downloads, dimensions, cancellation, supported browser formats. |
| UI / translations | ES and EN, keyboard access, mobile and desktop, readable errors. |
| Session / Worker | Anonymous vs authenticated requests, cache behavior, no identity leakage. |
| Social preview | Public image GET/HEAD, static metadata, canonical URLs and both languages. |

CI runs `npm ci`, `npm test` and `npm run build` on Node 22 and 24. There is no separate lint command. The current automated suite contains 22 checks; browser export behavior still needs manual verification.

## Local login simulation

After building, use `npm run preview:auth -- --mock-auth` on loopback. It is a development-only fake session, not proof that real ChatGPT OAuth works. Never deploy the preview server or trust client-supplied identity headers outside the Sites gateway.

## En español

Haz un fork, crea una rama desde `main` y envía un pull request con el problema, el cambio y las pruebas realizadas. Para cambios grandes, abre primero un issue. Puedes escribir el reporte y el pull request en español.

Antes de hacer commit, ejecuta `npm test` y `npm run build`, corrige errores y advertencias y vuelve a compilar. Los mensajes de commit deben estar en español y sin caracteres especiales. No uses `any` ni `as any`; conserva el tipado estricto y los switches exhaustivos.

Comprueba ambos idiomas, los formatos de salida afectados y la persistencia de borradores. Actualiza la documentación y la procedencia de los recursos que añadas.

## Review and scope

Maintainers review changes before merging. A contribution does not automatically deploy to the live Site. Public GitHub CI does not have production credentials.

Report sensitive security issues using [SECURITY.md](SECURITY.md), rather than a public issue.
