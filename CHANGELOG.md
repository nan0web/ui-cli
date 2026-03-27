# Changelog @nan0web/ui-cli

## [2.8.0] — 2026-03-27

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
