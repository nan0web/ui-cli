# @nan0web/ui-cli

A modern, interactive UI input adapter for Java•Script projects, powered by the `prompts` engine.
It provides a premium "Lux-level" terminal experience that can be easily integrated with shared application logic.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/ui-cli` package transforms basic CLI interactions into a stunning, interactive experience.
Built with the "One Logic, Many UI" philosophy, it allows you to use the same business logic across Web and Terminal environments.

Key Features:

- **Interactive Prompts** — Sleek, colorized selection lists and text inputs via `prompts`.
- **Search & Autocomplete** — Find what you need in large datasets with live search.
- **Interactive Tables** — View and filter tabular data directly in the terminal.
- **Security-First** — Built-in support for password masking and secret inputs.
- **Schema-Driven Forms** — Automatically generate complex CLI forms from your data models.
- **Input Adapter** — A standardized bridge between logic and terminal UI.
- **Modern Aesthetics** — Rich colors, clear structure, and intuitive navigation (including `::prev` commands).

Core components:

- `select(config)` — Beautiful interactive selection list with support for large datasets (`limit`).
- `autocomplete(config)` — Searchable selection with async fetching support.
- `table(config)` — Live-filtering data table.
- `multiselect(config)` — Multiple selection with checkboxes.
- `mask(config)` — Formatted input masks (phone, date, etc).
- `text(config)` — Modern interactive text or password input.
- `confirm(message)` — Simple yet elegant Yes/No prompt.

## Installation

Install using your preferred package manager:

How to install with npm?
```bash
npm install @nan0web/ui-cli
```

How to install with pnpm?
```bash
pnpm add @nan0web/ui-cli
```

How to install with yarn?
```bash
yarn add @nan0web/ui-cli
```

## Premium Aesthetics

`@nan0web/ui-cli` isn't just about functionality; it's about the **experience**.

- **Fluent Navigation**: Seamlessly navigate through complex forms.
- **Error Handling**: Elegant validation messages that guide the user.
- **Rich Colors**: Integrated with `@nan0web/log` for a professional TTY look.

## Usage

### CLiInputAdapter

The adapter provides methods to handle form, input, and select requests.

#### requestForm(form, options)

Displays a form and collects user input field-by-field with validation.

How to request form input via CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
const adapter = new CLiInputAdapter()
const fields = [
	{ name: 'name', label: 'Full Name', required: true },
	{ name: 'email', label: 'Email', type: 'email', required: true },
]
const validateValue = (name, value) => {
	if (name === 'email' && !value.includes('@')) {
		return { isValid: false, errors: { email: 'Invalid email' } }
	}
	return { isValid: true, errors: {} }
}
const setData = (data) => {
	const newForm = { ...form }
	newForm.state = data
	return newForm
}
const form = UiForm.from({
	title: 'User Profile',
	fields,
	id: 'user-profile-form',
	validateValue,
	setData,
	state: {},
	validate: () => ({ isValid: true, errors: {} }),
})
const result = await adapter.requestForm(form, { silent: true })
console.info(result.form.state) // ← { name: "John Doe", email: "John.Doe@example.com" }
```
#### requestAutocomplete(config)

Performs a searchable selection. Supports static options or async fetch functions.

```javascript
const adapter = new CLiInputAdapter()
const result = await adapter.requestAutocomplete({
  message: 'Choose AI model:',
  options: async (query) => [
    { title: 'GPT-4', value: 'gpt-4' },
    { title: 'Claude 3', value: 'claude3' }
  ].filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
})
const model = result.value
```

How to request autocomplete via CLiInputAdapter?
```js
const adapter = new CLiInputAdapter()
const result = await adapter.requestAutocomplete({
	message: 'Choose model',
	options: [
		{ title: 'GPT-4', value: 'gpt-4' },
		{ title: 'Claude 3', value: 'claude3' }
	]
})
```
#### requestMultiselect(config)

Requests multiple selection from a list.

```javascript
const result = await adapter.requestMultiselect({
  message: 'Select fruits:',
  options: ['Apple', 'Banana', 'Orange'],
  initial: ['Apple']
})
const fruits = result.value
```

How to request multiselect via CLiInputAdapter?
```js
const adapter = new CLiInputAdapter()
const result = await adapter.requestMultiselect({
	message: 'Select items',
	options: ['Option A', 'Option B']
})
```
#### requestMask(config)

Requests input with a specific format mask.

```javascript
const result = await adapter.requestMask({
  message: 'Enter phone:',
  mask: '(###) ###-####',
  placeholder: '(000) 000-0000'
})
const phone = result.value
```

How to request masked input via CLiInputAdapter?
```js
const adapter = new CLiInputAdapter()
const result = await adapter.requestMask({
	message: 'Phone',
	mask: '###-###'
})
```
#### requestTable(config)

Renders an interactive table with live filtering.

```javascript
await adapter.requestTable({
  data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
  title: 'User List',
  columns: ['id', 'name']
})
```

How to show interactive table via CLiInputAdapter?
```js
const adapter = new CLiInputAdapter()
const result = await adapter.requestTable({
	data: [{ id: 1, name: 'Alice' }],
	interactive: false // non-interactive for test
})
```
#### requestInput(config)

Simple single-field request. Supports `password` type for secure masking.

```javascript
const result = await adapter.requestInput({
  message: 'Enter API Key:',
  type: 'password'
})
const password = result.value
```

How to request password via CLiInputAdapter?
```js
const adapter = new CLiInputAdapter()
const result = await adapter.requestInput({
	message: 'Enter Secret:',
	type: 'password'
})
```
### UI Utilities

/**
@docs
#### `select(config)`

Interactive selection list. Use `limit` to control the number of visible items.

How to prompt user with select()?
```js
import { select } from '@nan0web/ui-cli'
const result = await select({
	title: 'Choose an option:',
	options: ['Option A', 'Option B', 'Option C'],
	limit: 5
})
console.info(result.value) // ← Option B
```
#### `Input` class

Holds user input and tracks cancelation events.

How to use the Input class?
```js
import { Input } from '@nan0web/ui-cli'
const input = new Input({ value: 'test', stops: ['quit'] })
console.info(String(input)) // ← test
console.info(input.value) // ← test
console.info(input.cancelled) // ← false
input.value = 'quit'
console.info(input.cancelled) // ← true
```
#### `ask(question)`

Prompts the user with a question and returns a promise with the answer.

How to ask a question with ask()?
```js
import { ask } from "@nan0web/ui-cli"
const result = await ask('What is your name?')
console.info(result)
```
#### `createInput(stops)`

Creates a configurable input handler with stop keywords.

How to use createInput handler?
```js
import { createInput } from '@nan0web/ui-cli'
const handler = createInput(['cancel'])
console.info(typeof handler === 'function') // ← true
```
#### `confirm(message)`

Poses a yes/no question to the user.

How to pose a confirmation question with confirm()?
```js
import { confirm } from '@nan0web/ui-cli'
const result = await confirm('Do you want to proceed?')
console.info(result.value) // ← true
```
#### `select(config)`

Presents a beautiful interactive list of options.

How to prompt user with select()?
```js
import { select } from '@nan0web/ui-cli'
const config = {
	title: 'Choose an option:',
	options: ['Option A', 'Option B', 'Option C'],
	console: console,
}
const result = await select(config)
console.info(result.value)
```
#### `next(conf)`

Waits for a keypress to continue the process.

How to pause and wait for keypress with next()?
```js
import { next } from '@nan0web/ui-cli'
const result = await next()
console.info(typeof result === 'string')
```
#### `pause(ms)`

Returns a promise that resolves after a given delay.

How to delay execution with pause()?
```js
import { pause } from '@nan0web/ui-cli'
const before = Date.now()
await pause(10)
const after = Date.now()
const isAtLeast9 = after - before >= 9
console.info(isAtLeast9) // ← true
```
### Errors

#### `CancelError`

Thrown when a user interrupts a process.

How to handle CancelError?
```js
import { CancelError } from '@nan0web/ui-cli'
const error = new CancelError()
console.error(error.message) // ← Operation cancelled by user
```
## API

### CLiInputAdapter

* **Methods**
  * `requestForm(form, options)` — (async) handles form request
  * `requestSelect(config)` — (async) handles selection prompt
  * `requestInput(config)` — (async) handles single input prompt

### Input

* **Properties**
  * `value` – (string) current input value.
  * `stops` – (array) cancellation keywords.
  * `cancelled` – (boolean) whether input is cancelled.

* **Methods**
  * `toString()` – returns current value as string.
  * `static from(input)` – instantiates from input object.

### ask(question)

* **Parameters**
  * `question` (string) – prompt text
* **Returns** Promise<string>

### createInput(stops)

* **Parameters**
  * `stops` (array) – stop values
* **Returns** function handler

### select(config)

* **Parameters**
  * `config.title` (string) – selection title
  * `config.options` (array | Map) – options to choose from
* **Returns** Promise<{ index, value, cancelled }>

### confirm(message)

* **Parameters**
  * `message` (string) – confirmation question
* **Returns** Promise<{ value, cancelled }>

### next([conf])

* **Parameters**
  * `conf` (string) – accepted key sequence
* **Returns** Promise<string>

### pause(ms)

* **Parameters**
  * `ms` (number) – delay in milliseconds
* **Returns** Promise<void>

### CancelError

Extends `Error`, thrown when an input is cancelled.

All exported classes and functions should pass basic tests

## Java•Script

Uses `d.ts` files for autocompletion

## Playground

How to run playground script?
```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/ui-cli.git
cd ui-cli
npm install
npm run playground
```

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
