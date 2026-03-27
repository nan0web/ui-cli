# @nan0web/ui-cli

[🇺🇦 Українська версія](./docs/uk/README.md) | [🇬🇧 English version](./docs/en/README.md)

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

How to install the package?
```bash
npm install @nan0web/ui-cli
```

## nan0cli — Universal CLI Runner

The `nan0cli` binary provides a universal entry point for any nan0web application.
It reads the app's `package.json`, resolves the CLI entry point, and runs commands.

The `nan0cli` binary is registered and available.

### Error Handling

When no entry point is found, `nan0cli` displays a styled `Alert` error and exits with code 1.
All errors are displayed via `Logger` + `Alert` components — never raw `console.log`.

All errors are beautifully formatted.

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
#### DateTime

How to use DateTime component?
```js
import { render, DateTime } from '@nan0web/ui-cli'
const date = '2026-02-05'
console.info(`Date: ${date}`)
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
## Legacy API

### CLiInputAdapter

How to request form input via CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```
### Functional Utilities

#### ask()

How to ask a question with ask()?
```js
import { ask } from "@nan0web/ui-cli"
```
#### Execution Control

#### pause()

How to pause code execution?
```js
import { pause } from '@nan0web/ui-cli'
await pause(10)
console.info('Done')
```
## Playground

How to run the playground?
```bash
npm run play
```

## License

How to check the license? - [ISC LICENSE](./LICENSE) file.
