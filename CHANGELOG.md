
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-05

### Added
- **Mask Component Visuals**: Implemented `Manual Stdout Override` for `Mask` component to guarantee correctly formatted output (e.g. `+380...`) in terminals, preventing raw input leakage.
- **Smart Prefix Logic**: Added intelligent handling for mask prefixes (e.g. typing `380` into `+38` mask) to prevent data duplication.
- **System Protocols**: Established "TEST-FIRST FOR BUGS" protocol in `system.md` to mandate TDD for all bug fixes.
- **Testing**: Added `test:i18n` script for automated localization verification.
- **Validation**: Introduced strict prop validation for `Input`, `Select`, `Slider`, `TreeView`, and `DateTime`.
- **Localization**: Added deep localization support for `Confirm`, `Table`, `Multiselect` and all prompt instructions.
- **Architecture**: Implemented `InputAdapter` injection pattern for universal component testing.

### Fixed
- **Prefix Duplication**: Fixed an issue where typing the mask prefix (e.g. `38` in `380`) resulted in shifted/broken input.
- **Visual Glitches**: Resolved visual discrepancy in `Mask` component where raw input was displayed after submission.
- **V2 Demo**: Fixed file system mocking in `Tree` demo and corrected snapshot sequences.
- **Process Hangs**: Fixed process hanging issues in `ui/next.js` by implementing correct pause/resume logic.

### Changed
- **Strict Mode**: `Mask` component now internally overrides `prompts` stdout rendering for final value display.
- **Documentation**: Updated `README.md` and `MIGRATION.md` to reflect V2 architecture and strict validation rules.

## [1.1.1] - 2026-02-03
### Fixed
- Fixed localization bugs in `DateTime` component.
- Resolved CLI timeouts in automated testing environments.

## [1.1.0] - 2026-02-02
### Added
- Initial support for TreeView component.
- Added prompt injection mechanism for E2E testing.
