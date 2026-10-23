# Security

The maintained version is the current `main` branch. The project is a browser-based editor with a Sites authentication boundary; it does not provide cloud draft storage.

Please report vulnerabilities privately using [GitHub private vulnerability reporting](https://github.com/globodex/devday-studio/security/advisories/new). Do not put tokens, personal photos, private drafts or another person's account data in public issues.

Include the affected commit, reproduction steps, observed impact and a minimal example with synthetic data. Reports may be written in English or Spanish.

## Relevant boundaries

- Real authentication belongs to the Sites gateway. Incoming identity headers are trusted only behind that gateway.
- The loopback preview's fake session must never be used as production authentication.
- localStorage and JSON backups are not encrypted storage.
- Imported data, URLs, photo inputs and session JSON need validation/escaping.
- GitHub CI has read-only repository permissions and no production secrets.

En español: reporta problemas de seguridad mediante el enlace privado anterior. Incluye pasos reproducibles y datos ficticios; no publiques credenciales ni información personal.
