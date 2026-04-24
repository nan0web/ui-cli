# @nan0web/ui-cli

<!-- %LANGS% -->

A modern, interactive UI input adapter for Node.js projects.
Powered by the `prompts` engine, it provides a premium "Lux-level" terminal experience.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/ui-cli` package transforms basic CLI interactions into stunning, interactive experiences using the "One Logic, Many UI" philosophy.

Key Features:
- **Universal Runner** — Start your CLI app in 1 line of code with `bootstrapApp`.
- **Interactive Prompts** — Sleek selection lists, masked inputs, and searchable autocomplete.
- **Aesthetic Standards** — Pixel-perfect 5-character gutter (`{}  |`) for all components.
- **Schema-Driven Forms** — Generate complex CLI forms directly from your data models.
- **Build Optimization** — Blazing fast monorepo type-checking with isolated package depth.
- **One Logic, Many UI** — Use the same shared logic across Web and Terminal.

## Installation

How to install the package?
```bash
npm install @nan0web/ui-cli
```

## Universal CLI Runner

The `bootstrapApp` is the modern way to bootstrap CLI applications.
It handles model-to-argv parsing, i18n initialization, and lifecycle management.

### Security: The seal() Protocol

To ensure system integrity, `bootstrapApp` automatically locks the database using `db.seal()`.
This prevents any runtime modifications to the DB structure or mounts after initialization.
**Requirement**: Requires a modern `@nan0web/db` version supporting the seal protocol.

## Model-as-App (Recommended)

The `ModelAsApp` class provides a unified architecture for both Domain Logic and UI Presentation.
It automatically handles CLI help generation, subcommand routing, and i18n variables.

How to bootstrap a CLI application?
```js
import { bootstrapApp, ModelAsApp, show } from '@nan0web/ui-cli'
class StatusApp extends ModelAsApp {
	static UI = { title: 'Status', fine: 'Everything is fine' }
	static debug = { type: 'boolean', help: 'Debug mode', default: false }
	async *run() {
		yield show(StatusApp.UI.fine)
	}
}
class RootApp extends ModelAsApp {
	static command = { positional: true, type: [StatusApp] }
}
await bootstrapApp(RootApp)
```
### Headless Execution & Built-in Apps

You can execute an OLMUI Model programmatically without any interactive UI adapter by calling `ModelAsApp.execute()`.
This is perfect for automation scripts like the `ReadmeMd` documentation generator.

Additionally, standard tools are natively aliased in `nan0cli`:

How to run internal apps like ReadmeMd?
```js
/* Programmatic Headless Execution:
import { ReadmeMd } from '@nan0web/ui-cli/domain/ReadmeMd.js'
await ReadmeMd.execute({ data: 'docs' })
*/
/* Or via Terminal CLI Alias:
nan0cli docs --data=docs
*/
```
## Usage (V2 Architecture)

Starting from v2.0, we recommend using the `render()` function with Composable Components.

### Interactive Prompts

#### Input & Password

How to use Input and Password components?
```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = 'Alice'
console.info(`User: ${user}`)
```
#### Select & Multiselect

How to use Select component?
```js
import { render, Select } from '@nan0web/ui-cli'
const lang = { value: 'en' }
console.info(`Selected: ${lang.value}`)
```
#### Multiselect

How to use Multiselect component?
```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`)
```
#### Masked Input

How to use Mask component?
```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`)
```
#### Autocomplete

How to use Autocomplete component?
```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`)
```
#### Slider, Toggle & DateTime

How to use Slider and Toggle?
```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`)
const active = true
console.info(`Active: ${active}`)
```
#### Tree Selection
Hierarchical data selection made easy.

How to use Tree component?
```js
import { render, Tree } from '@nan0web/ui-cli'
const selected = '/src/index.js'
console.info(`Selected file: ${selected}`)
```
#### Sortable Lists
Drag and drop items in the terminal.

How to use Sortable component?
```js
import { render, Sortable } from '@nan0web/ui-cli'
const items = ['First', 'Second', 'Third']
console.info(`Order: ${items.join(' > ')}`)
```
### Static Views

#### Alerts

How to render Alerts?
```js
import { Alert } from '@nan0web/ui-cli'
console.info('Success Operation')
```
#### Dynamic Tables

How to render Tables?
```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data)
```
### Feedback & Progress

#### Spinner

How to use Spinner?
```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Loading...')
```
#### Progress Bars

How to use ProgressBar?
```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Progress: 100%')
```
### Sub-path Exports (OLMUI)

The package uses "One Logic, Many UI" (OLMUI) architecture, exposing only strict architectural boundaries.

- `import { ModelAsApp } from '@nan0web/ui-cli/domain'` — Domain Base classes.
- `import { App } from '@nan0web/ui-cli/app'` — Main Application Model & Router.
- `import { playground } from '@nan0web/ui-cli/test'` — Testing & Snapshot utilities.

How to use isolated domain models and UI adapters?

## Legacy API

### CLiInputAdapter

How to request form input via CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```
## Playground

How to run the playground?
```bash
npm run play
```

## License

How to check the license? - [ISC LICENSE](./LICENSE) file.
