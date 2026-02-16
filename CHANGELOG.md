# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-13

### Added

- **Universal CLI Runner (`nan0cli`)**: New binary (`bin/nan0cli.js`) that can execute any app's CLI logic without requiring per-app boilerplate.
- **CLI Class**: New `CLI` class for structured command handling with `CommandParser`.
- **Form Generation**: Added `Form` component and `generateForm` utility for schema-driven forms.
- **Command & Parse Utils**: Exported `Command` class and `str2argv` parser utility.

### Changed

- **Dependencies**: Replaced `workspace:*` dependency for `@nan0web/ui` with concrete `^1.1.0` version for isolated install support.

### Fixed

- **Package Publishing**: Ensured `bin/**/*.js` is included in `files` array for correct npm distribution.

## [2.0.0] - 2026-02-05

### Added

- **UI Architecture V2 (Prompt/View)**: Complete rewrite of component architecture splitting logic into `Prompt` (interactive) and `View` (static) components.
- **Manual Stdout Override**: `Mask` component now manually overwrites the final output line to ensure the formatted value (e.g. `+380...`) is displayed terminals.
- **Smart Prefix Logic**: `Mask` intelligently handles user-typed prefixes (e.g. typing `380` into `+38` mask) to prevent data duplication.
- **TDD Protocols**: Established "The Sandbox Rule" and "The Final Stroke" in system documentation.
- **Validators**: Added strict `PropValidation` for all inputs (`validateString`, `validateNumber`, etc).
- **Localization**: Full I18n support for all components including `Confirm`, `Table`, `Multiselect`.
- **System**: Implemented `pause()` and `next()` controls for better flow management.
- **Tree Component**: New file system navigation component with async loading simulation.

### Fixed

- **Slider UX**: Removed duplicate range display `(0-100) (0-100)` in prompts.
- **Mask Input**: Fixed "crooked" input shifting when users type the mask prefix manually.
- **Process Hangs**: Fixed process hanging issues in `ui/next.js` cleanup.
- **Types**: Resolved strict TypeScript compilation errors across the package.

### Changed

- **CLI Adapter**: `CLiInputAdapter` now injects `t` function automatically into components.
- **Exports**: Standardized exports into `src/components/prompt` and `src/components/view` with backward compatibility layers.

## [1.2.0] - 2026-02-04

_Internal checkpoint before V2 migration._

### Added

- **Documentation Testing**: Implemented `console.output()` verification for README examples.
- **UI Refresh**: Modernized prompt aesthetics and improved color localization.

### Changed

- Refactored `select` and `slider` visuals.
- Updated README with unified return contract specifications.

## [1.1.1] - 2026-02-03

### Fixed

- **CLI Runner**: Fixed command execution logic in `CLiInputAdapter`.

## [1.1.0] - 2026-02-02

### Added

- **Schema Forms**: Added schema-driven form generation support.
- **Select Handling**: Integrated `UiMessage.requireInput` into adapter.

### Changed

- **Renaming**: Renamed `CLIInputAdapter` to `CLiInputAdapter` (standardization).

## [1.0.2] - 2026-01-20

### Fixed

- **Validation**: Improved `CommandHelp` validation logic.
- **Dependencies**: Bumped internal dependency versions.

## [1.0.1] - 2026-01-15

### Fixed

- **Packaging**: Compact version of package.json.
- **Naming**: Renamed `rootClasses` to `Messages`.
- **Core**: Replaced `Command` with `CLI` architecture base.

## [1.0.0] - 2026-01-01

### Added

- Initial stable release of UI-CLI package.
