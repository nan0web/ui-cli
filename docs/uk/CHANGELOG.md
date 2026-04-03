# Changelog

## [2.12.0] — 2026-04-03

### Додано
- **Безпечний запуск (Протокол seal())**: Впроваджено сувору валідацію під час ініціалізації `bootstrapApp`. Тепер додатки вимагають сучасної версії `@nan0web/db` з підтримкою методу `seal()`.
- **Дотримання Model-First i18n**: Лейбли футера ContentViewer (Focus, Select, Scroll, Back) тепер динамічно керуються через екземпляр `ContentViewerModel` для більшої гнучкості в різних контекстах.

### Виправлено
- **Неконтрольований вихід процесу**: Рефакторинг `bootstrapApp` для зручності тестування шляхом впровадження конфігурації `noExit: true`, що запобігає завершенню процесу тест-раннера під час верифікації.
- **Failfast для несумісних БД**: Додано негайний `TypeError` при спробі використати застарілу версію БД, що запобігає виникненню каскадних помилок пізніше в життєвому циклі.

## [2.11.0] — 2026-04-03

### Додано
- **Універсальний запуск**: Впроваджено утиліту `bootstrapApp` для ініціалізації CLI додатків в 1 рядок коду з повним керуванням життєвим циклом.
- **Парсинг аргументів з Моделі**: Автоматичне відображення аргументів CLI на поля доменної моделі на основі метаданих Model-as-Schema v2.
- **Покращена документація (ProvenDoc)**: Інтегровано інтерактивні компоненти `Tree` та `Sortable` в автоматичну генерацію README.md.
- **Українська локалізація**: Повна синхронізація української документації в `docs/uk/README.md`.

### Змінено
- **Міграція регресії**: Контрактні тести релізів `task.spec.js` перенесено в постійну базу регресії в `src/test/releases/`.
- **Чистота API**: Видалено аліас `cliApp` для дотримання єдиного стандарту найменування `bootstrapApp`.

### Виправлено
- Синтаксичну помилку в `bootstrapApp.js` через дублювання експортів.
- Відносні шляхи імпорту в мігрованих тестах регресії.

## [2.10.0] — 2026-04-01

### Додано
- **Interactive ContentViewer**: Механізм нелінійної навігації по Markdown документах з підтримкою вибору посилань та вбудованих форм.
- **OLMUI Form Popups**: Система динамічного виклику форм прямо в контексті перегляду контенту.
- **Model-First i18n для ContentViewer**: Переклад усіх токенів інтерфейсу (Focus, Scroll, Select) через архітектурно-детерміновані ключі в `ContentViewerModel`.
- **Static Schema Discovery**: Оновлено двигун `generateForm` для надійного виявлення статичних полів класів.

### Змінено
- **Рефакторинг IntentDispatcher**: Логіка рендерингу контенту делегована високорівневому компоненту `ContentViewer`.

## [2.9.0] — 2026-03-27

### Додано
- **Model-as-Schema v2**: Усі UI компоненти тепер повністю керуються доменними моделями.
- **Лінгвістичний Суверенітет**: Ієрархічна система документації в `docs/uk/` та `docs/en/`.
- **Детектор i18n**: Новий інструмент `bin/inspect-i18n.js` для контролю політики Zero-Hardcode.
- **CLI Галерея**: Структуровані знімки в `snapshots/cli/` з логотипом проекту.

## [2.7.0] - 2026-03-17

### Added

- **Positional Args Resolution (`resolvePositionalArgs`)**: New universal utility for mapping CLI positional arguments to Model-as-Schema fields. Models declare `positional: true` in their static field descriptors; the framework resolves them by declaration order, with named options taking priority.
  ```js
  import { resolvePositionalArgs } from '@nan0web/ui-cli'
  const data = resolvePositionalArgs(MyModel, positionals, namedOptions)
  ```
- **`positional: true` Metadata Convention**: New Model-as-Schema standard property. Fields marked `positional: true` are automatically eligible for positional CLI argument resolution. The order follows JavaScript's property declaration order (guaranteed for non-integer keys).
- **Model-from-Argv (`modelFromArgv`)**: Universal CLI-to-Model bridge. Auto-generates `parseArgs` config from Model static field descriptors, resolves positionals, and returns a fully constructed Model instance. Reduces CLI wrappers to a single line:
  ```js
  import { modelFromArgv } from '@nan0web/ui-cli'
  const model = modelFromArgv(MyModel, process.argv.slice(2))
  ```

## [2.6.0] - 2026-03-17

### Added

- **Blueprint Project Generator**: `blueprint/project.js` now generates real `project.md` and `project.yaml` files with 9-phase structure, YAML frontmatter, and Definition of Done checklist.
- **Array Type Mapping**: `generateForm` now safely maps `string[]`, `array`, `object` schema types to `text` inputs instead of crashing with `FormInput.type is invalid!`.

### Fixed

- **Model-as-Schema Form Filtering**: `generateForm` and `Form.#generateFields()` now ignore internal Model properties (`head`, `id`, `type`, `data`, `schema`, `fields`, `state`, `title`, `meta`) preventing them from appearing as CLI prompts.

## [2.5.1] - 2026-03-13

### Fixed

- **Package Artifacts**: Fixed NPM package publication by excluding internal testing readmes (`src/README.md.js`) and adding `.npmignore` to reduce tarball size from 270kB to 258kB.

## [2.5.0] - 2026-03-12

### Changed

- **Event-Driven PlaygroundTest**: Replaced hard-coded `delayMs = 120` timer in `PlaygroundTest#feedSequence` with event-driven `stdoutBuffer` analysis for CLI render markers. Snapshot tests now run ~3x faster (~16s vs ~45-60s) with 100% process isolation preserved.
- **Sandbox Test Isolation**: Each sandbox test uses unique `.cli-sandbox.*.json` config files with UUID to prevent race conditions between parallel runs.

### Fixed

- **Release Migration**: Migrated v2.4.0 contract spec to regression test suite (`src/test/releases/`).

## [2.4.0] - 2026-03-09

### Added

- **Universal Snapshot Output Normalizer**: New `normalize()` and `collectReplacements()` utilities in `@nan0web/ui-cli/test` for deterministic CLI output comparison.
- **Component Snapshot Replacements**: `Spinner.snapshotReplacements` and `ProgressBar.snapshotReplacements` static properties for automatic normalization of spinner frames, progress bars, and time durations.
- **Tree Normalizer**: `TREE_REPLACEMENTS` for normalizing file/folder icons and expand/collapse arrows.

## [2.3.0] - 2026-03-01

### Added

- **Semantic Snapshots**: Snapshot tests now produce semantically meaningful output files.
- **Tree Incremental Search**: TAB-search/incremental jump navigation in Tree component.
- **Stabilized Types**: Resolved strict TypeScript compilation across the package.

## [2.2.2] - 2026-02-28

### Fixed

- **Form Export**: Fixed `Form` export and async render handling in `nan0cli` runner.

## [2.2.1] - 2026-02-27

### Fixed

- **CommandHelp Export**: Added missing `CommandHelp` export.
- **Table Column Inference**: Fixed automatic column detection from data arrays.

## [2.2.0] - 2026-02-25

### Added

- **Unified Form Renderer**: `Form` class is now the single CLI renderer for schema-driven forms. `InputAdapter.requestForm()` delegates to `Form` directly.
- **Snapshot Mandate**: Established UI Engineering Protocols for snapshot-based verification.

### Changed

- **Form Type Safety**: `Form` enforces strict numeric typing for number fields.


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
