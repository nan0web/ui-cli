# Changelog @nan0web/ui-cli

## [2.12.0] — 2026-04-03

### Added
- **Secure App Bootstrap (The seal() protocol)**: Implemented strict validation during `bootstrapApp` initialization. Applications now require a modern `@nan0web/db` version with the `seal()` capability.
- **Model-First i18n Enforcement**: ContentViewer footer labels (Focus, Select, Scroll, Back) are now dynamically driven by the `ContentViewerModel` instance for better flexibility across different contexts.

### Fixed
- **Uncontrolled Process Exit**: Refactored `bootstrapApp` to be test-friendly by introducing the `noExit: true` configuration, preventing test runner process termination during verification.
- **Incompatible DB Failfast**: Added immediate `TypeError` if a legacy DB attempt is made, preventing silent errors later in the lifecycle.

## [2.11.0] — 2026-04-03

### Added
- **Universal App Runner**: Introduced `bootstrapApp` utility for 1-line CLI app initialization with full lifecycle management.
- **Model-to-Argv Parsing**: Automated mapping of CLI arguments to domain model fields based on Model-as-Schema v2 metadata.
- **Enhanced Documentation (ProvenDoc)**: Integrated interactive `Tree` and `Sortable` components into the automated README.md generation.
- **Full UK Localization**: Synchronized Ukrainian documentation in `docs/uk/README.md`.

### Changed
- **Regression Migration**: Migrated `task.spec.js` release contracts to a permanent regression test hub at `src/test/releases/`.
- **API Cleanliness**: Removed `cliApp` alias to enforce the universal `bootstrapApp` naming convention.

### Fixed
- Syntax error in `bootstrapApp.js` caused by duplicate exports.
- Relative import paths in migrated regression tests.

## [2.10.0] — 2026-04-01

### Added
- **Interactive ContentViewer**: Implemented full non-linear navigation mechanism for Markdown documents with support for link selection and embedded forms.
- **OLMUI Form Popups**: Introduced a system for dynamic form invocation directly within the content viewing context.
- **Model-First i18n for ContentViewer**: Translated all interface tokens (Focus, Scroll, Select) into architecturally-deterministic keys in `ContentViewerModel`.
- **Static Schema Discovery**: Upgraded `generateForm` engine for reliable detection of static class fields via `Object.getOwnPropertyNames`.

### Changed
- **IntentDispatcher Refactoring**: Content rendering logic is now delegated from low-level rendering functions to the high-level `ContentViewer` prompt component.
- **Result Standardization**: Unified the return format: interaction results (form payload or link parameters) are now consistently accessible via the `value` property.

## [2.9.0] — 2026-03-27

### Added
- **Model-as-Schema v2**: All UI components are now fully driven by domain models.
- **Linguistic Sovereignty**: Hierarchical documentation system in `docs/uk/` and `docs/en/`.
- **Deterministic i18n Auditor**: New `bin/inspect-i18n.js` tool to enforce Zero-Hardcode policy.
- **CLI Gallery**: Structured snapshots in `snapshots/cli/` with a project logo.
- **Heart Logo**: Added `nan0web_cli_heart_logo.png` as the official project symbol.

### Changed
- **Directory Structure**: Centralized core logic in `src/ui/core/`, implementations in `src/ui/impl/`.
- **README.md**: Now a generated gateway (ProvenDoc) with multi-language support.
- **InputAdapter**: Updated to support late-bound i18n and model-driven translations.

### Fixed
- TypeScript definitions for `Mask`, `Sortable`, and `Table` components.
- Import path resolution across the restructured `src/ui/` hierarchy.
- Documentation tests synchronization with the new structure.

### Removed
- Redundant binary tools (`check-i18n.js`, `gallery.js`, `sandbox.js`).
- Loose documentation files from the root directory.
- Historical `seed.md` files.

---
@nan0web CLI — "One Logic, Many UI" 🏺✨
