[Українська версія](./task.md)

# Release Mission v2.12.2

## Scope
Dependency update and synchronization with recent changes in `core` and `co` (stabilization via uniform `workspace:*` protocol).

## Definition of Done
- All specified dependencies in `package.json` (`@nan0web/core`, `@nan0web/db`, `@nan0web/types`, `@nan0web/i18n`) are set to `workspace:*`. This ensures synchronization across the monorepo upon publication.
- No functional changes in the CLI core. Ensured full readiness for Patch release publication.

## Architecture Audit (Checklist)
- [x] Ecosystem Indices read?
- [x] Analogues exist in packages?
- [x] Data sources: YAML, nano, md, json, csv?
- [x] Complies with UI standard (Deep Linking)?
