# Requests

## Problem: `workspace:*` dependencies break isolated install

**Target**: `package.json`
**Status**: ✅ DONE
**Date**: 2026-02-13

**Problem**:
Dependencies defined with `workspace:*` require the package to be part of the monorepo workspace. This breaks isolated installations.

**Required Action**:
Update `package.json` dependencies to use specific versions instead of `workspace:*`.

**Changes**:

- "@nan0web/ui": "workspace:\*" -> "^1.1.0"

## Feature: Universal CLI Runner (nan0cli)

**Target**: `package.json`, `bin/nan0cli.js`, `src/index.js`
**Status**: ✅ DONE
**Date**: 2026-02-13

**Goal**:
Transform `@nan0web/ui-cli` from a library into a universal runner capable of executing any app's CLI logic without requiring per-app boilerplate (`main.js`).

**Requirements**:

1.  **Binary**: Provide `nan0cli` (or `nano-cli`) executable.
2.  **Context Awareness**:
    - Detect current working directory (CWD).
    - Read `package.json` to find app configuration (e.g. `nan0web.cli`).
    - Or fallback to convention: `src/messages/index.js` or `src/cli.js`.
3.  **Dynamic Loading**:
    - Import the App's `Messages` or `CLI` configuration.
    - Instantiate `CLI` with the App's logic.
4.  **Commands**:
    - `nan0cli <command>`: Execute app command.
    - `nan0cli help`: Show available commands from the App.
5.  **Testing**:
    - Add integration tests simulating an external app with a `package.json` and `messages`.
    - Ensure `npx` behavior works as expected.

**Proposed Implementation**:

### package.json

```json
"bin": {
  "nan0cli": "./bin/nan0cli.js"
}
```

### bin/nan0cli.js

The runner should:

1.  Parse arguments.
2.  Look for `nan0web` config in `package.json`.
3.  `import(path_to_messages)`.
4.  `new CLI({ Messages, argv }).run()`.

**Example Usage**:

```bash
# In auth.app directory
npx @nan0web/ui-cli signup
# or if installed globally
nan0cli signup
```

---

## Universal Documentation Blocks (Phase 8 MVP)

**Target**: `src/BlockRenderers/*`
**Status**: ✅ DONE
**Date**: 2026-03-08

**Problem**:
CLI UI does not currently support the new `Layout.*` or `Control.*` namespaces defined in `UNIVERSAL_BLOCKS_SPEC.md` (e.g. `Layout.Page`, `Layout.Sidebar`, `Control.ThemeToggle`).

**Required Action**:
Implement text-based log/terminal fallbacks in `ui-cli`:

- `Layout.Page`, `Layout.Nav` could act as section boundaries or headers in CLI.
- `Layout.Sidebar` could render as an indented tree list in the terminal.
- `Control.*` blocks can either be gracefully ignored or represent a CLI interactive prompt if necessary.

**Changes Made**:

1. Created `src/BlockRenderers/Layout.js` with terminal fallback implementations for `Page`, `Nav`, and `Sidebar` that output structured CLI text sections.
2. Created `src/BlockRenderers/Control.js` to gracefully ignore `ThemeToggle` without throwing errors.
3. Exported both `Layout` and `Control` namespaces from `src/index.js` to align with the Universal Blocks specification.

---

## Architecture: Adherence to Universal Blocks Spec (The "Constitution")

**Target**: `ui-cli` Ecosystem, `play/sandbox.js`
**Status**: ✅ DONE
**Date**: 2026-03-02

**Problem**:
As the UI ecosystem grows (`ui-react`, `ui-lit`, `ui-cli`), each package risks developing its own isolated UX standards (e.g., how the Sandbox works, how Props are saved, how default Fallbacks are handled).

**Required Action**:
Define the UI Core (`@nan0web/ui/project.md`) as the ultimate "Constitution" for component APIs and Sandbox standard behavior. `ui-cli` must formally act as an implementer of these standards, not a definer of new ones.

**Changes Made**:

1. Added explicit architectural references in `README.md` stating that `ui-cli` adheres strictly to the Universal Blocks Spec.
2. Formatted the local `play/sandbox.js` CLI Editor to execute precisely according to the Universal UX guidelines: state persistence (`.cli-sandbox.json`), prop fallbacks, interactive execution (Live Preview / Prompts), and dynamic variation management.
3. Full component catalog (19 components: 7 Views + 12 Prompts) registered in the Sandbox with `defaultProps`, `schema`, and `render` functions.

---

## Performance: Autocomplete Event Loop Lag Optimization

**Target**: `src/ui/autocomplete.js`
**Status**: ✅ DONE
**Date**: 2026-03-01

**Problem**:
Users reported severe input lag and "sticky" keystrokes when interacting with `Autocomplete` large datasets. This was caused by repeated instantiation of Regular Expressions on every keystroke and heavy reliance on asynchronous `async/await` boundaries even when option data was fully static (local array).

**Required Action**:
Optimize the `Autocomplete` component structure for minimal blocking on the event loop.

**Changes Made**:

1. **RegEx Caching**: Pre-compiled and cached `RegExp` filtering instances during initialization instead of re-instantiating them inside the `.filter()` loop.
2. **Synchronous Fetch Path**: Introduced an explicit `fetchSync` execution path for fully static lists, bypassing Promise creation and Node.js microtask queue latency during suggestion updates.
3. **Filtering Optimizations**: Trimmed down array allocations during mapping/filtering steps, drastically reducing memory garbage collection pressure when the user is typing fast.

---

## Refactoring: Data-Driven Generator Architecture & DBFS i18n Integration

**Target**: [src/core/render.js](src/core/render.js), `@nan0web/ui-cli` Ecosystem, apps using `ui-cli` (like `grow.app`)
**Status**: ✅ DONE
**Date**: 2026-03-01

**Problem**:
Earlier versions of CLI apps were hardcoding logic boundaries using massive `async/await` blocks, statically importing `InputAdapter` pre-bound to hardcoded dictionaries (e.g. `ui.js`). This violated the ecosystem pattern of dynamically structured Data-Driven Apps relying on `i18n` Data and Model isolation. Furthermore, `app.yaml` structures and global configs were hardcoded.

**Required Action**:
Transform CLI applications to leverage a `Generator` (`async function* run()`) pattern that `yields` UI definitions dynamically, decoupling the UI from execution engines and relying completely on `DB` localized data blocks.

**Changes Made**:

1. **Generator Pattern (`yield`)**: Components like `Select`, `Input`, `Autocomplete`, `Alert`, and `Table` are now yielded for evaluation.
2. **Render Runner (`bin/cli.js`)**: Provided a standardized iterator loop that uses `render(component)` to orchestrate `yield` flow, naturally intercepting UI `CancelError` signals (via Esc) and translating them to safe `undefined` returns.
3. **DBFS Data Integration**: Enforced the `langDb = db.extract(G_LANG)` abstraction to automatically resolve configuration trees (like `_/menu.yaml`) based on context, bypassing manual per-path locale injections (`fetch(G_LANG + '/...')`).
4. **i18n Adoption**: Integrated the `@nan0web/i18n` generator (`createT`) to use YAML datasets natively from `data/**/t.yaml`, removing rogue hardcoded variables.

---

## Feature: Tree Search & Incremental Jump Navigation (v2.3.0)

**Target**: `src/ui/tree.js`, `src/InputAdapter.js`
**Status**: ✅ DONE
**Date**: 2026-02-27

**Problem**:
The `Tree` component supported only basic arrow-key navigation. Users working with large directory trees had no way to quickly locate files by name — every selection required manual traversal of the entire tree structure.

**Required Action**:
Add two search modes to the `Tree` component: full-text TAB-activated filter search, and implicit incremental jump (type-to-seek).

**Changes Made**:

1. **TAB Search Mode**: Pressing `Tab` activates a live filter mode. The flat list is re-computed to show only nodes whose `name` matches the filter string (case-insensitive). Parent directories with matching children are auto-included. Pressing `Tab` or `Escape` exits search mode.
2. **Incremental Jump**: Typing any printable character outside search mode adds it to a `searchBuffer` with a 700ms debounce timer. The cursor jumps to the first node whose name starts with the accumulated buffer, providing Finder-like quick navigation.
3. **Scroll Offset Correction**: Both search modes correctly update `state.offset` to keep the matched cursor position within the visible viewport (`limit` window).
4. **Canonical Snapshot Rendering**: Added `renderCanonical()` for `UI_SNAPSHOT` mode, producing deterministic text output (`[TREE]`, `*` cursor, `[-]/[+]` expand markers) suitable for Golden Master comparison.
5. **Snapshot Tests**: Added `tree_search.en.snap` and `tree_search.uk.snap` — dual-locale Golden Master files verifying the complete TAB-search scenario.

---

## Feature: Object Map Form (`renderForm`) — Interactive Property Editor

**Target**: `src/InputAdapter.js` (`CLiInputAdapter.renderForm`), `src/ui/form.js`, `play/object-form-demo.js`
**Status**: ✅ DONE
**Date**: 2026-02-27

**Problem**:
CLI forms were strictly linear — fields had to be filled sequentially (`Form.requireInput()`). This prevented editing of structured objects (like a `Branch` with `address`, `city`, `onDuty`, `type` fields) where the user needs to jump freely between fields, see current values, and selectively edit individual properties.

**Required Action**:
Implement a non-linear "Object Map" form renderer in `CLiInputAdapter` that presents all fields as a navigable menu with current values displayed inline.

**Changes Made**:

1. **`renderForm(data, SchemaClass)` method**: New method on `CLiInputAdapter` that creates a `Form` instance from a schema class and returns a `{ fill() }` API for the interactive editing loop.
2. **Menu-based navigation**: Each field is displayed as `FieldLabel: [currentValue]` in a Select menu. The user picks a field to edit, edits it via the appropriate prompt (Input, Toggle, Select, Slider, Mask), then returns to the menu.
3. **Cursor Persistence**: The `lastIndex` variable tracks the user's position in the menu. After editing a field, the cursor returns to the same position — preventing the "jump to top" regression that was identified and fixed.
4. **Save/Cancel Footer**: A visual separator (`──────────────────────────`) followed by `✅ Save and exit` and `❌ Cancel changes` actions.
5. **Type-aware Display**: Boolean values show localized `Yes`/`No`, objects are JSON-stringified, long strings are truncated to 50 chars.
6. **Snapshot Tests**: Added `object_form.{en,uk}.snap` and `object_form_complex.{en,uk}.snap` — 4 new Golden Master files verifying both text-field editing and Select-type field editing scenarios.
7. **Demo**: `play/object-form-demo.js` with a `Branch` schema (address, city, onDuty boolean, type select).

---

## Infrastructure: Snapshot Test Suite Expansion (34 Golden Masters)

**Target**: `play/snapshot.test.js`, `play/snapshots/*.snap`
**Status**: ✅ DONE
**Date**: 2026-03-02

**Problem**:
The original snapshot infrastructure covered 26 files (13 scenarios × 2 locales). New components (Tree Search, Object Form) and UI changes in v2_components required new snapshot scenarios but the test harness lacked support for custom delimiters and per-locale input sequences.

**Required Action**:
Expand the snapshot test infrastructure with support for custom `PLAY_DEMO_DIVIDER`, per-locale input sequences (`seq_uk`), and new normalization rules for tree/braille symbols.

**Changes Made**:

1. **17 Scenarios × 2 Locales = 34 Snapshot Files**: Added `tree_search`, `object_form`, `object_form_complex` scenarios with appropriate input sequences.
2. **Output Normalization**: Extended `normalizeOutput()` with rules for tree icons (`📁→[D]`, `📄→[F]`, `▼→v`, `▶→>`, Braille patterns `→*`), progress bar stabilization, and spinner frame deduplication.
3. **Per-locale Sequences**: `seq_uk` field allows Ukrainian-language input sequences (e.g. `Адреса|Нова адреса|Місто|Нове місто|_save`) alongside English defaults.
4. **Custom Dividers**: `divider` field allows pipe-separated (`|`) sequences for scenarios where commas appear within field values (e.g. Object Form, Sortable).
5. **docs/SNAPSHOT_MAP.md**: Created comprehensive reference document linking all 17 scenarios to their English and Ukrainian snapshot files.
6. **docs/SOVEREIGN_REPORT.md**: Created Ukrainian-language sovereign visual reference report with carousel showcases and post-mortem of critical fixes.

---

## Feature: Component Sandbox (CLI OlmuiInspector)

**Target**: `play/sandbox.js`, `.cli-sandbox.json`
**Status**: ✅ DONE
**Date**: 2026-03-02

**Problem**:
Developers had no unified way to test individual CLI components with custom props in isolation. Each component required a separate demo script, and there was no persistent state management for prop variations.

**Required Action**:
Implement a CLI-native Component Sandbox (OlmuiInspector pattern) following the Universal Blocks Spec UX standards: catalog browsing, variation management, prop editing, and live preview with state persistence.

**Changes Made**:

1. **Full Catalog**: 19 components registered — 7 View components (Alert, Badge, Toast, Table, Tabs, Breadcrumbs, Steps) and 12 Prompt components (Input, Password, Toggle, Confirm, Select, Multiselect, Slider, DateTime, Tree, Spinner, ProgressBar, Sortable).
2. **Variation Management**: Each component supports multiple named variations. Users can create, edit, reset, and delete variations. Default variation cannot be deleted.
3. **Prop Schema & Editing**: Each component defines a `schema` array of editable props (`text`, `select` types). Editing a prop immediately updates the variation and persists to `.cli-sandbox.json`.
4. **Live Preview**: View components render inline after prop changes. Prompt components offer a `▶ Run Prompt (Test)` action to execute interactively.
5. **State Persistence**: `.cli-sandbox.json` stores all variations and prop overrides. Loaded on startup, saved after every mutation.
6. **Fallback Logic**: Empty or undefined props fall back to `defaultProps` during rendering, following the Universal Blocks Spec's fallback convention.

---

## Infrastructure: Multi-frame Snapshot Testing & Auto-Gallery

**Target**: `play/snapshot.test.js`, `scripts/gallery.mjs`
**Status**: ✅ DONE
**Date**: 2026-03-03

**Problem**:
Certain interactive CLI components (like `Autocomplete`, `Spinner`, `ProgressBar`) produce multiple frames or animated outputs that overwrite each other in the terminal. Traditional single-string snapshots failed to capture these intermediate states or caused test instability due to timing issues. Furthermore, the markdown galleries included themselves in the generated output.

**Required Action**:

1. Implement frame-by-frame snapshot capturing for animated/multi-step components.
2. Ensure snapshots are split into separate files (e.g., `autocomplete.1.snap`, `autocomplete.2.snap`) to maintain chronological visual history.
3. Update the `gallery.mjs` script to properly parse multiframe extensions and exclude `index.md`.

**Changes Made**:

1. **Multi-frame UI_SNAPSHOT Support**: Modified `InputAdapter.requestAutocomplete` to detect `UI_SNAPSHOT` mode and emit sequentially timed frames separated by `[SNAPSHOT_FRAME]` markers. Supported both functional and array-based `config.options`.
2. **Snapshot Test Splitter**: Updated `verifySnapshot` in `play/snapshot.test.js` to split execution output by `[SNAPSHOT_FRAME]` and save chronological `file.N.snap` files.
3. **Gallery Enhancements**: Upgraded `getFiles` in `gallery.mjs` to ignore `index.md`. Improved title generation to cleanly format frame numbers like `Autocomplete En (Крок 1)`.
4. **Git Hygiene**: Added `*.snap` to `.gitignore` and removed 34 redundant `.snap` files from the git index, as the generated `index.md` galleries act as the true canonical reference.

---

## Feature: Universal Snapshot Output Normalizer

**Target**: `src/test/normalize.js`, компоненти (`Spinner`, `ProgressBar`, тощо)
**Status**: ✅ DONE
**Date**: 2026-03-12

**Problem**:
Кожен проєкт, що використовує CLI snapshot тести, дублює логіку нормалізації виводу: ANSI strip, spinner frames, progress bars, duration timestamps. Наприклад, `@industrialbank/currencies` має локальну `normalizeOutput()` з 8+ regex-замінами, які ідентичні тим, що потрібні і в інших проєктах.

**Required Action**:
Створити загальну утиліту `normalize(str, replacements=[])` у `src/test/normalize.js` та додати `snapshotReplacements` як статичну властивість до компонентів, що створюють нестабільний вивід.

**Architecture**:

### 1. `src/test/normalize.js`

```js
/** Базові ANSI-заміни — завжди застосовуються */
const ANSI = [
	{ pattern: /\x1B\[[0-9;?]*[a-zA-Z]/g, replacement: '' },
	{ pattern: /^\s+/, replacement: '' },
]

/**
 * Нормалізує CLI вивід для snapshot порівняння.
 * @param {string} str — сирий stdout/stderr
 * @param {Array<{pattern: RegExp, replacement?: string}>} replacements
 */
export function normalize(str, replacements = []) {
	let result = str
	for (const { pattern, replacement } of [...ANSI, ...replacements]) {
		result = result.replace(pattern, replacement ?? '')
	}
	return result.trim()
}

/** Збирає snapshotReplacements з усіх компонентів */
export function collectReplacements(...components) {
	return components
		.filter(c => c.snapshotReplacements)
		.flatMap(c => c.snapshotReplacements)
}
```

### 2. Per-component `snapshotReplacements`

```js
// Spinner.js
Spinner.snapshotReplacements = [
	{ pattern: /^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏].*$/gm, replacement: '[SPINNER]' },
	{ pattern: /(\[SPINNER\]\n?)+/g, replacement: '[SPINNER]\n' },
	{ pattern: /\[\d{2}:\d{2}\]/g, replacement: '[XX:XX]' },
]

// ProgressBar.js
ProgressBar.snapshotReplacements = [
	{ pattern: /\[=*>?-*\] \d+% \[\d{2}:\d{2}( < \d{2}:\d{2})?\]/g, replacement: '[PROGRESS]' },
]
```

### 3. Споживач

```js
import { normalize, collectReplacements } from '@nan0web/ui-cli/test'
import { Spinner, ProgressBar } from '@nan0web/ui-cli'

// Вибірково
const output = normalize(raw, Spinner.snapshotReplacements)

// Або всі
const output = normalize(raw, collectReplacements(Spinner, ProgressBar))
```

**Principle**: Якщо компонент не має `snapshotReplacements` — пропускаємо. Кожен компонент відповідає за знання своїх артефактів.

**Changes Made**:

1. **`src/test/normalize.js`** — Створено модуль з `normalize(str, replacements=[])`, `collectReplacements(...components)`, та `TREE_REPLACEMENTS` constant. Базове ANSI-стрипання завжди застосовується автоматично.
2. **`Spinner.snapshotReplacements`** — Додана статична властивість до класу `Spinner` з 3 правилами: braille frame → `[SPINNER]`, дедуплікація, `[XX:XX]` для таймерів.
3. **`ProgressBar.snapshotReplacements`** — Додана статична властивість до класу `ProgressBar` з 1 правилом: bar pattern → `[PROGRESS]`.
4. **`src/test/index.js`** — Оновлено sub-path export `@nan0web/ui-cli/test` для включення `normalize`, `collectReplacements`, `TREE_REPLACEMENTS`.
5. **`play/snapshot.test.js`** — Рефакторинг: локальна `normalizeOutput()` замінена на compose з `normalize()` + `collectReplacements()` + `TREE_REPLACEMENTS`. Видалено 25 рядків дубльованих regex.
6. **`play/main.test.js`** — Виправлено pre-existing баг: тест `runs select demo then exits` падав через `UI_SNAPSHOT=1`, яке блокувало predefined answers у `#nextAnswer()`. Додано `UI_SNAPSHOT: ''` для цього тесту.
7. **Types** — `types/test/normalize.d.ts` та `types/test/index.d.ts` auto-generated, покривають повний API.


