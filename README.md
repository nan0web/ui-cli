# @nan0web/ui-cli

A modern, interactive UI input adapter for Node.js projects.
Powered by the `prompts` engine, it provides a premium "Lux-level" terminal experience.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/ui-cli` package transforms basic CLI interactions into stunning, interactive experiences using the "One Logic, Many UI" philosophy.

Key Features:
- **Interactive Prompts** — Sleek selection lists, masked inputs, and searchable autocomplete.
- **Schema-Driven Forms** — Generate complex CLI forms directly from your data models.
- **Premium Aesthetics** — Rich colors, clear structure, and intuitive navigation.
- **One Logic, Many UI** — Use the same shared logic across Web and Terminal.

## Installation

Install using your preferred package manager:

```bash
npm install @nan0web/ui-cli
```

How to install the package?

## nan0cli — Universal CLI Runner

The `nan0cli` binary provides a universal entry point for any nan0web application.
It reads the app's `package.json`, resolves the CLI entry point, and runs commands.

### App Contract

Your app must export Messages from its entry point:

```js
// E1: Messages Array (recommended)
export default [Serve, Dump]

// E2: Single Message class (auto-wrapped to array)
export default class MyApp { }
```

### Entry Point Resolution

`nan0cli` looks for the entry point in this order:
1. `nan0web.cli.entry` field in `package.json`
2. `src/cli.js` (convention)
3. `src/messages/index.js` (legacy)

### Configuration

```json
{
  "nan0web": {
    "cli": { "entry": "src/cli.js" }
  }
}
```

nan0cli binary is registered

### Error Handling

When no entry point is found, `nan0cli` displays a styled `Alert` error and exits with code 1.
All errors are displayed via `Logger` + `Alert` components — never raw `console.log`.

nan0cli is included in package files

## Usage (V2 Architecture)

Starting from v2.0, we recommend using the `render()` function with Composable Components.

### Interactive Prompts

/**
@docs
#### Input & Password

How to use Input and Password components?
```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = await ask('Username')
console.info(`User: ${user}`) // -> User: Alice
const pass = await ask('Enter Secret:')
console.info(`Secret: ${pass}`) // -> Secret: secret-key
```
#### Select & Multiselect

How to use Select component?
```js
import { render, Select } from '@nan0web/ui-cli'
const lang = await select({ title: 'Choose Language:' })
console.info(`Selected: ${lang.value}`) // -> Selected: en
```
#### Multiselect

How to use Multiselect component?
```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`) // -> Roles: admin, user
```
#### Masked Input

How to use Mask component?
```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`) // -> Phone: 123-456
```
#### Autocomplete

How to use Autocomplete component?
```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`) // -> Model: gpt-4
```
#### Slider, Toggle & DateTime

How to use Slider and Toggle?
```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`) // -> Volume: 50
const active = true
console.info(`Active: ${active}`) // -> Active: true
```
#### DateTime

How to use DateTime component?
```js
import { render, DateTime } from '@nan0web/ui-cli'
const date = '2026-02-05'
console.info(`Date: ${date}`) // -> Date: 2026-02-05
```
### Static Views

How to render Alerts?
```js
import { Alert } from '@nan0web/ui-cli'
console.info('Success Operation') // -> Success Operation
```
#### Dynamic Tables

How to render Tables?
```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data) // -> [ { id: 1, name: 'Alice' } ]
```
### Feedback & Progress

How to use Spinner?
```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Loading...') // -> Loading...
```
#### Progress Bars

How to use ProgressBar?
```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Progress: 100%') // -> Progress: 100%
```
## Legacy API

### CLiInputAdapter

How to request form input via CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
const adapter = new CLiInputAdapter()
const fields = [{ name: 'name', label: 'Full Name' }]
const form = UiForm.from({
	fields,
	state: {},
	setData: (data) => {
		form.state = data
		return form
	},
	validateValue: () => ({ isValid: true, errors: {} }),
	validate: () => ({ isValid: true, errors: {} }),
})
const result = await adapter.requestForm(form, { silent: true })
console.info(result.form.state) // -> { name: "John Doe" }
```
### Functional Utilities

How to ask a question with ask()?
```js
import { ask } from "@nan0web/ui-cli"
const result = await ask('What is your name?')
console.info(result) // -> Alice
```
#### Execution Control

How to pause code execution?
```js
import { pause } from '@nan0web/ui-cli'
await pause(10)
console.info('Done') // -> Done
```
## Playground

```bash
npm run play
```

How to run the playground?

## License

ISC © [Check here](./LICENSE)

How to check the license?
