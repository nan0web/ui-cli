# @nan0web/ui-cli

A tiny, zero‑dependency UI input adapter for Java•Script projects.
It provides a CLI implementation that can be easily integrated
with application logic.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/ui-cli` package provides a set of tools for handling
CLI user input through structured forms, selections and prompts.
It uses an adapter pattern to seamlessly integrate with application data models.

Core classes:

- `CLIInputAdapter` — handles form, input, and select requests in CLI.
- `Input` — wraps user input with value and cancellation status.
- `CancelError` — thrown when a user cancels an operation.

These classes are perfect for building prompts, wizards, forms,
and interactive CLI tools with minimal overhead.

## Installation

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

## Usage

### CLIInputAdapter

The adapter provides methods to handle form, input, and select requests.

#### requestForm(form, options)

Displays a form and collects user input field-by-field with validation.

How to request form input via CLIInputAdapter?
```js
import { CLIInputAdapter } from '@nan0web/ui-cli'
const adapter = new CLIInputAdapter()
const fields = [
	{ name: "name", label: "Full Name", required: true },
	{ name: "email", label: "Email", type: "email", required: true },
]
const validateValue = (name, value) => {
	if (name === "email" && !value.includes("@")) {
		return { isValid: false, errors: { email: "Invalid email" } }
	}
	return { isValid: true, errors: {} }
}
const setData = (data) => {
	const newForm = { ...form }
	newForm.state = data
	return newForm
}
const form = UIForm.from({
	title: "User Profile",
	fields,
	id: "user-profile-form",
	validateValue,
	setData,
	state: {},
	validate: () => ({ isValid: true, errors: {} }),
})
const result = await adapter.requestForm(form, { silent: true })
console.info(result.form.state) // ← { name: "John Doe", email: "John.Doe@example.com" }
```

How to request select input via CLIInputAdapter?
```js
import { CLIInputAdapter } from '@nan0web/ui-cli'
const adapter = new CLIInputAdapter()
const config = {
	title: "Choose Language:",
	prompt: "Language (1-2): ",
	id: "language-select",
	options: new Map([
		["en", "English"],
		["uk", "Ukrainian"],
	]),
}
const result = await adapter.requestSelect(config)
console.info(result) // ← en
```
### Input Utilities

#### `Input` class

Holds user input and tracks cancelation events.

How to use the Input class?
```js
import { Input } from '@nan0web/ui-cli'
const input = new Input({ value: "test", stops: ["quit"] })
console.info(String(input)) // ← test
console.info(input.value) // ← test
console.info(input.cancelled) // ← false
input.value = "quit"
console.info(input.cancelled) // ← true
```
#### `ask(question)`

Prompts the user with a question and returns a promise with the answer.

How to ask a question with ask()?
```js
import { ask } from "@nan0web/ui-cli"
const result = await ask("What is your name?")
console.info(result)
```
#### `createInput(stops)`

Creates a configurable input handler with stop keywords.

How to use createInput handler?
```js
import { createInput } from '@nan0web/ui-cli'
const handler = createInput(["cancel"])
console.info(typeof handler === "function") // ← true
```
#### `select(config)`

Presents options to the user and returns a promise with selection.

How to prompt user with select()?
```js
import { select } from '@nan0web/ui-cli'
const config = {
	title: "Choose an option:",
	prompt: "Selection (1-3): ",
	options: ["Option A", "Option B", "Option C"],
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
console.info(typeof result === "string")
```
#### `pause(ms)`

Returns a promise that resolves after a given delay.

How to delay execution with pause()?
```js
import { pause } from '@nan0web/ui-cli'
const before = Date.now()
await pause(10)
const after = Date.now()
console.info(after - before >= 10) // ← true
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

### CLIInputAdapter

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
  * `config.prompt` (string) – prompt text
  * `config.options` (array | Map) – options to choose from
* **Returns** Promise<{ index, value }>

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
```js
try {
	const text = await fs.loadDocument("LICENSE")
```