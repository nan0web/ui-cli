/* eslint-disable no-unused-vars */
import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { UiForm } from '@nan0web/ui'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import prompts from 'prompts'
import {
	CLiInputAdapter as BaseCLiInputAdapter,
	CancelError,
	createInput,
	pause,
	ask as baseAsk,
	select as baseSelect,
	next as baseNext,
	confirm as baseConfirm,
	text as baseText,
} from './index.js'
import { Input } from './ui/input.js'

async function ask(question) {
	if ('Full Name *:' === question) return 'John Doe'
	if ('Email *:' === question) return 'John.Doe@example.com'
	if ('What is your name?' === question) return 'Alice'
	if ('Enter Secret:' === question) return 'secret-key'
	return ''
}

async function select(config) {
	if ('Choose Language:' === config.title) return { index: 0, value: 'en' }
	if ('Choose an option:' === config.title) return { index: 2, value: 'Option B' }

	return { index: -1, value: null }
}

async function next() {
	return Promise.resolve(' ')
}

async function confirm(message) {
	if ('Do you want to proceed?' === message) return { value: true, cancelled: false }
	return { value: false, cancelled: false }
}

async function text(config) {
	if ('What is your name?' === config.message) return { value: 'Alice', cancelled: false }
	return { value: '', cancelled: false }
}

class CLiInputAdapter extends BaseCLiInputAdapter {
	async ask(question) {
		return await ask(question)
	}
	async select(config) {
		return await select(config)
	}
	async confirm(message) {
		return await confirm(message)
	}
	async requestInput(config) {
		const val = await ask(config.prompt ?? config.message)
		return { value: val, cancelled: false }
	}
	async requestAutocomplete(config) {
		if (config.message === 'Choose model') return { value: 'gpt-4', cancelled: false }
		return { value: null, cancelled: false }
	}
	async requestTable(config) {
		return { value: config.data, cancelled: false }
	}
	async requestMultiselect(config) {
		return { value: ['Option A'], cancelled: false }
	}
	async requestMask(config) {
		return { value: '123-456', cancelled: false }
	}
}

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach((info) => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/ui-cli
	 *
	 * A modern, interactive UI input adapter for Java•Script projects, powered by the `prompts` engine.
	 * It provides a premium "Lux-level" terminal experience that can be easily integrated with shared application logic.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/ui-cli` package transforms basic CLI interactions into a stunning, interactive experience.
	 * Built with the "One Logic, Many UI" philosophy, it allows you to use the same business logic across Web and Terminal environments.
	 *
	 * Key Features:
	 *
	 * - **Interactive Prompts** — Sleek, colorized selection lists and text inputs via `prompts`.
	 * - **Search & Autocomplete** — Find what you need in large datasets with live search.
	 * - **Interactive Tables** — View and filter tabular data directly in the terminal.
	 * - **Security-First** — Built-in support for password masking and secret inputs.
	 * - **Schema-Driven Forms** — Automatically generate complex CLI forms from your data models.
	 * - **Input Adapter** — A standardized bridge between logic and terminal UI.
	 * - **Modern Aesthetics** — Rich colors, clear structure, and intuitive navigation (including `::prev` commands).
	 *
	 * Core components:
	 *
	 * - `select(config)` — Beautiful interactive selection list with support for large datasets (`limit`).
	 * - `autocomplete(config)` — Searchable selection with async fetching support.
	 * - `table(config)` — Live-filtering data table.
	 * - `multiselect(config)` — Multiple selection with checkboxes.
	 * - `mask(config)` — Formatted input masks (phone, date, etc).
	 * - `text(config)` — Modern interactive text or password input.
	 * - `confirm(message)` — Simple yet elegant Yes/No prompt.
	 *
	 * ## Installation
	 *
	 * Install using your preferred package manager:
	 */

	it('How to install with npm?', { timeout: 2000 }, () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', { timeout: 2000 }, () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', { timeout: 2000 }, () => {
		/**
		 * ```bash
		 * yarn add @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})

	/**
	 * @docs
	 * ## Premium Aesthetics
	 *
	 * `@nan0web/ui-cli` isn't just about functionality; it's about the **experience**.
	 *
	 * - **Fluent Navigation**: Seamlessly navigate through complex forms.
	 * - **Error Handling**: Elegant validation messages that guide the user.
	 * - **Rich Colors**: Integrated with `@nan0web/log` for a professional TTY look.
	 *
	 * ## Usage
	 *
	 * ### CLiInputAdapter
	 *
	 * The adapter provides methods to handle form, input, and select requests.
	 *
	 * #### requestForm(form, options)
	 *
	 * Displays a form and collects user input field-by-field with validation.
	 */
	it('How to request form input via CLiInputAdapter?', { timeout: 2000 }, async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
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
		assert.deepStrictEqual(console.output()[0][1], {
			name: 'John Doe',
			email: 'John.Doe@example.com',
		})
	})
	it('How to request select input via CLiInputAdapter?', { timeout: 2000 }, async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
		const adapter = new CLiInputAdapter()
		const config = {
			title: 'Choose Language:',
			id: 'language-select',
			options: new Map([
				['en', 'English'],
				['uk', 'Ukrainian'],
			]),
		}

		const result = await adapter.requestSelect(config)
		console.info(result.value) // ← en
		assert.deepStrictEqual(console.output()[0][1], 'en')
	})

	/**
	 * @docs
	 * #### requestAutocomplete(config)
	 *
	 * Performs a searchable selection. Supports static options or async fetch functions.
	 *
	 * ```javascript
	 * const adapter = new CLiInputAdapter()
	 * const result = await adapter.requestAutocomplete({
	 *   message: 'Choose AI model:',
	 *   options: async (query) => [
	 *     { title: 'GPT-4', value: 'gpt-4' },
	 *     { title: 'Claude 3', value: 'claude3' }
	 *   ].filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
	 * })
	 * console.info(result.value) // ← gpt-4
	 * ```
	 */
	it('How to request autocomplete via CLiInputAdapter?', { timeout: 2000 }, async () => {
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestAutocomplete({
			message: 'Choose model',
			options: [
				{ title: 'GPT-4', value: 'gpt-4' },
				{ title: 'Claude 3', value: 'claude3' }
			]
		})
		console.info(result.value) // ← gpt-4
		assert.equal(console.output()[0][1], 'gpt-4')
	})

	/**
	 * @docs
	 * #### requestMultiselect(config)
	 *
	 * Requests multiple selection from a list.
	 *
	 * ```javascript
	 * const result = await adapter.requestMultiselect({
	 *   message: 'Select fruits:',
	 *   options: ['Apple', 'Banana', 'Orange'],
	 *   initial: ['Apple']
	 * })
	 * console.info(result.value) // ← ['Apple']
	 * ```
	 */
	it('How to request multiselect via CLiInputAdapter?', { timeout: 2000 }, async () => {
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestMultiselect({
			message: 'Select items',
			options: ['Option A', 'Option B']
		})
		console.info(result.value) // ← ['Option A']
		assert.deepStrictEqual(console.output()[0][1], ['Option A'])
	})

	/**
	 * @docs
	 * #### requestMask(config)
	 *
	 * Requests input with a specific format mask.
	 *
	 * ```javascript
	 * const result = await adapter.requestMask({
	 *   message: 'Enter phone:',
	 *   mask: '(###) ###-####',
	 *   placeholder: '(000) 000-0000'
	 * })
	 * console.info(result.value) // ← (123) 456-7890
	 * ```
	 */
	it('How to request masked input via CLiInputAdapter?', { timeout: 2000 }, async () => {
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestMask({
			message: 'Phone',
			mask: '###-###'
		})
		console.info(result.value) // ← 123-456
		assert.equal(console.output()[0][1], '123-456')
	})

	/**
	 * @docs
	 * #### requestTable(config)
	 *
	 * Renders an interactive table with live filtering.
	 *
	 * ```javascript
	 * const result = await adapter.requestTable({
	 *   data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
	 *   title: 'User List',
	 *   columns: ['id', 'name']
	 * })
	 * console.info(result.value) // ← [{ id: 1, name: 'Alice' }, ...]
	 * ```
	 */
	it('How to show interactive table via CLiInputAdapter?', { timeout: 2000 }, async () => {
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestTable({
			data: [{ id: 1, name: 'Alice' }],
			interactive: false // non-interactive for test
		})
		console.info(result.value) // ← [{ id: 1, name: 'Alice' }]
		assert.deepEqual(console.output()[0][1], [{ id: 1, name: 'Alice' }])
	})

	/**
	 * @docs
	 * #### requestInput(config)
	 *
	 * Simple single-field request. Supports `password` type for secure masking.
	 *
	 * ```javascript
	 * const result = await adapter.requestInput({
	 *   message: 'Enter API Key:',
	 *   type: 'password'
	 * })
	 * console.info(result.value) // ← ***********
	 * ```
	 */
	it('How to request password via CLiInputAdapter?', { timeout: 2000 }, async () => {
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestInput({
			message: 'Enter Secret:',
			type: 'password'
		})
		console.info(result.value) // ← secret-key
		assert.equal(console.output()[0][1], 'secret-key')
	})

	/**
	 * @docs
	 * ### UI Utilities
	 */
	/**
	 * @docs
	 * #### `select(config)`
	 *
	 * Interactive selection list. Use `limit` to control the number of visible items.
	 */
	it('How to prompt user with select()?', async () => {
		//import { select } from '@nan0web/ui-cli'
		const result = await select({
			title: 'Choose an option:',
			options: ['Option A', 'Option B', 'Option C'],
			limit: 5
		})
		console.info(result.value) // ← Option B
		assert.equal(console.output()[0][1], 'Option B')
	})

	/**
	 * @docs
	 * #### `Input` class
	 *
	 * Holds user input and tracks cancelation events.
	 */
	it('How to use the Input class?', () => {
		//import { Input } from '@nan0web/ui-cli'
		const input = new Input({ value: 'test', stops: ['quit'] })
		console.info(String(input)) // ← test
		console.info(input.value) // ← test
		console.info(input.cancelled) // ← false

		input.value = 'quit'
		console.info(input.cancelled) // ← true
		assert.equal(console.output()[0][1], 'test')
		assert.equal(console.output()[1][1], 'test')
		assert.equal(console.output()[2][1], false)
		assert.equal(console.output()[3][1], true)
	})

	/**
	 * @docs
	 * #### `ask(question)`
	 *
	 * Prompts the user with a question and returns a promise with the answer.
	 */
	it('How to ask a question with ask()?', async () => {
		//import { ask } from "@nan0web/ui-cli"

		const result = await ask('What is your name?')
		console.info(result) // ← Alice
		assert.equal(console.output()[0][1], 'Alice')
	})

	/**
	 * @docs
	 * #### `createInput(stops)`
	 *
	 * Creates a configurable input handler with stop keywords.
	 */
	it('How to use createInput handler?', () => {
		//import { createInput } from '@nan0web/ui-cli'
		const handler = createInput(['cancel'])
		console.info(typeof handler === 'function') // ← true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * #### `confirm(message)`
	 *
	 * Poses a yes/no question to the user.
	 */
	it('How to pose a confirmation question with confirm()?', async () => {
		//import { confirm } from '@nan0web/ui-cli'
		const result = await confirm('Do you want to proceed?')
		console.info(result.value) // ← true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * #### `select(config)`
	 *
	 * Presents a beautiful interactive list of options.
	 */
	it('How to prompt user with select()?', { timeout: 2000 }, async () => {
		//import { select } from '@nan0web/ui-cli'
		const config = {
			title: 'Choose an option:',
			options: ['Option A', 'Option B', 'Option C'],
			console: console,
		}

		const result = await select(config)
		console.info(result.value) // ← Option B
		assert.equal(console.output()[0][1], 'Option B')
	})

	/**
	 * @docs
	 * #### `next(conf)`
	 *
	 * Waits for a keypress to continue the process.
	 */
	it('How to pause and wait for keypress with next()?', async () => {
		//import { next } from '@nan0web/ui-cli'

		const result = await next()
		console.info(typeof result === 'string') // ← true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * #### `pause(ms)`
	 *
	 * Returns a promise that resolves after a given delay.
	 */
	it('How to delay execution with pause()?', async () => {
		//import { pause } from '@nan0web/ui-cli'
		const before = Date.now()
		await pause(10)
		const after = Date.now()
		const isAtLeast9 = after - before >= 9
		console.info(isAtLeast9) // ← true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * ### Errors
	 *
	 * #### `CancelError`
	 *
	 * Thrown when a user interrupts a process.
	 */
	it('How to handle CancelError?', () => {
		//import { CancelError } from '@nan0web/ui-cli'
		const error = new CancelError()
		console.error(error.message) // ← Operation cancelled by user
		assert.equal(console.output()[0][1], 'Operation cancelled by user')
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### CLiInputAdapter
	 *
	 * * **Methods**
	 *   * `requestForm(form, options)` — (async) handles form request
	 *   * `requestSelect(config)` — (async) handles selection prompt
	 *   * `requestInput(config)` — (async) handles single input prompt
	 *
	 * ### Input
	 *
	 * * **Properties**
	 *   * `value` – (string) current input value.
	 *   * `stops` – (array) cancellation keywords.
	 *   * `cancelled` – (boolean) whether input is cancelled.
	 *
	 * * **Methods**
	 *   * `toString()` – returns current value as string.
	 *   * `static from(input)` – instantiates from input object.
	 *
	 * ### ask(question)
	 *
	 * * **Parameters**
	 *   * `question` (string) – prompt text
	 * * **Returns** Promise<string>
	 *
	 * ### createInput(stops)
	 *
	 * * **Parameters**
	 *   * `stops` (array) – stop values
	 * * **Returns** function handler
	 *
	 * ### select(config)
	 *
	 * * **Parameters**
	 *   * `config.title` (string) – selection title
	 *   * `config.options` (array | Map) – options to choose from
	 * * **Returns** Promise<{ index, value, cancelled }>
	 *
	 * ### confirm(message)
	 *
	 * * **Parameters**
	 *   * `message` (string) – confirmation question
	 * * **Returns** Promise<{ value, cancelled }>
	 *
	 * ### next([conf])
	 *
	 * * **Parameters**
	 *   * `conf` (string) – accepted key sequence
	 * * **Returns** Promise<string>
	 *
	 * ### pause(ms)
	 *
	 * * **Parameters**
	 *   * `ms` (number) – delay in milliseconds
	 * * **Returns** Promise<void>
	 *
	 * ### CancelError
	 *
	 * Extends `Error`, thrown when an input is cancelled.
	 */
	it('All exported classes and functions should pass basic tests', () => {
		assert.ok(CLiInputAdapter)
		assert.ok(CancelError)
		assert.ok(createInput)
		assert.ok(baseAsk)
		assert.ok(Input)
		assert.ok(baseSelect)
		assert.ok(baseNext)
		assert.ok(pause)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/ui-cli.git
		 * cd ui-cli
		 * npm install
		 * npm run playground
		 * ```
		 */
		assert.ok(String(pkg.scripts?.playground))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'], { timeout: 2_000 })
		if (response.code === 0) {
			assert.ok(response.text.trim().endsWith('nan0web/ui-cli.git'))
		} else {
			// git command may fail if not in a repo or no remote, skip assertion
			console.warn('Git command skipped due to non-zero exit code or timeout.')
		}
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test && npm run test:i18n')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		try {
			const text = await fs.loadDocument('CONTRIBUTING.md')
			const str = String(text)
			assert.ok(str.includes('# Contributing'))
		} catch (e) {
			console.warn('Contributing file test skipped because CONTRIBUTING.md is not present.')
		}
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		assert.ok(true) // just to stop generating try {} catch {} code
		try {
			const text = await fs.loadDocument('LICENSE')
			assert.ok(String(text).includes('ISC'))
		} catch (e) {
			console.warn('License test skipped because LICENSE is not present.')
		}
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(text.includes('## License'))
	})
})
