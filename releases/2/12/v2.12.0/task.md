# Release Mission: @nan0web/ui-cli v2.12.0

## 🎯 Scope
Implement a secure application bootstrap protocol (seal) and ensure atomic model-driven i18n for UI components.

## ✅ Acceptance Criteria (Definition of Done)
1. [x] `bootstrapApp` must reject databases without the `seal()` method (TypeError).
2. [x] `bootstrapApp` must successfully call `db.seal()` before app execution.
3. [x] `bootstrapApp` must support `config.noExit` for isolated testing.
4. [x] `ContentViewer` footer labels must be driven by `ContentViewerModel` instance (Model-First i18n).
5. [x] Documentation (`README.md`, `CHANGELOG.md`) must be updated in EN and UK locales.
6. [x] All 169 package tests must pass (`npm run test:all`).

## 🛡️ Architecture Audit
- [x] ECOSYSTEM: No duplication with existing packages.
- [x] DATA: Uses `DB` (nan0web/db) as the source of truth.
- [x] STANDARDS: Follows OLMUI (One Logic, Many UI) principles.
- [x] I18N: Model-First keys used for all new UI labels.
