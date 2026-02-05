/* eslint-disable no-unused-vars */
import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { UiForm } from '@nan0web/ui'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
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
	if (question.includes('Username')) return 'Alice'
	if (question.includes('Secret')) return 'secret-key'
	if (question.includes('Full Name')) return 'John Doe'
	return 'Alice'
}

async function select(config) {
	if (config.title?.includes('Language')) return { index: 0, value: 'en' }
	return { index: 1, value: 'Option B' }
}

async function next() {
	return Promise.resolve(' ')
}
async function confirm(message) {
	return { value: true, cancelled: false }
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
		return { value: 'gpt-4', cancelled: false }
	}
	async requestTable(config) {
		return { value: config.data, cancelled: false }
	}
	async requestMultiselect(config) {
		return { value: ['en'], cancelled: false }
	}
	async requestMask(config) {
		return { value: '123-456', cancelled: false }
	}
}

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/ui-cli
	 *
	 * A modern, interactive UI input adapter for Node.js projects.
	 * Powered by the `prompts` engine, it provides a premium "Lux-level" terminal experience.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/ui-cli` package transforms basic CLI interactions into stunning, interactive experiences using the "One Logic, Many UI" philosophy.
	 *
	 * Key Features:
	 * - **Interactive Prompts** — Sleek selection lists, masked inputs, and searchable autocomplete.
	 * - **Schema-Driven Forms** — Generate complex CLI forms directly from your data models.
	 * - **Premium Aesthetics** — Rich colors, clear structure, and intuitive navigation.
	 * - **One Logic, Many UI** — Use the same shared logic across Web and Terminal.
	 *
	 * ## Installation
	 *
	 * Install using your preferred package manager:
	 *
	 * ```bash
	 * npm install @nan0web/ui-cli
	 * ```
	 */
	it('How to install the package?', () => {
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})

	/**
	 * @docs
	 * ## Usage (V2 Architecture)
	 *
	 * Starting from v2.0, we recommend using the `render()` function with Composable Components.
	 *
	 * ### Interactive Prompts
	 */

	/**
	 * @docs
	 * #### Input & Password
	 */
	it('How to use Input and Password components?', async () => {
		//import { render, Input, Password } from '@nan0web/ui-cli'
		const user = await ask('Username')
		console.info(`User: ${user}`) // -> User: Alice

		const pass = await ask('Enter Secret:')
		console.info(`Secret: ${pass}`) // -> Secret: secret-key

		assert.deepStrictEqual(console.output().length, 2)
	})

	/**
	 * @docs
	 * #### Select & Multiselect
	 */
	it('How to use Select component?', async () => {
		//import { render, Select } from '@nan0web/ui-cli'
		const lang = await select({ title: 'Choose Language:' })
		console.info(`Selected: ${lang.value}`) // -> Selected: en

		assert.deepStrictEqual(console.output()[0][1], 'Selected: en')
	})

	/**
	 * @docs
	 * #### Multiselect
	 */
	it('How to use Multiselect component?', async () => {
		//import { render, Multiselect } from '@nan0web/ui-cli'
		const roles = ['admin', 'user']
		console.info(`Roles: ${roles.join(', ')}`) // -> Roles: admin, user

		assert.deepStrictEqual(console.output()[0][1], 'Roles: admin, user')
	})

	/**
	 * @docs
	 * #### Masked Input
	 */
	it('How to use Mask component?', async () => {
		//import { render, Mask } from '@nan0web/ui-cli'
		const phone = '123-456'
		console.info(`Phone: ${phone}`) // -> Phone: 123-456

		assert.deepStrictEqual(console.output()[0][1], 'Phone: 123-456')
	})

	/**
	 * @docs
	 * #### Autocomplete
	 */
	it('How to use Autocomplete component?', async () => {
		//import { render, Autocomplete } from '@nan0web/ui-cli'
		const model = 'gpt-4'
		console.info(`Model: ${model}`) // -> Model: gpt-4

		assert.deepStrictEqual(console.output()[0][1], 'Model: gpt-4')
	})

	/**
	 * @docs
	 * #### Slider, Toggle & DateTime
	 */
	it('How to use Slider and Toggle?', async () => {
		//import { render, Slider, Toggle } from '@nan0web/ui-cli'
		const volume = 50
		console.info(`Volume: ${volume}`) // -> Volume: 50
		const active = true
		console.info(`Active: ${active}`) // -> Active: true

		assert.deepStrictEqual(console.output().length, 2)
	})

	/**
	 * @docs
	 * #### DateTime
	 */
	it('How to use DateTime component?', async () => {
		//import { render, DateTime } from '@nan0web/ui-cli'
		const date = '2026-02-05'
		console.info(`Date: ${date}`) // -> Date: 2026-02-05

		assert.deepStrictEqual(console.output()[0][1], 'Date: 2026-02-05')
	})

	/**
	 * @docs
	 * ### Static Views
	 */
	it('How to render Alerts?', async () => {
		//import { Alert } from '@nan0web/ui-cli'
		console.info('Success Operation') // -> Success Operation
		assert.deepStrictEqual(console.output()[0][1], 'Success Operation')
	})

	/**
	 * @docs
	 * #### Dynamic Tables
	 */
	it('How to render Tables?', async () => {
		//import { Table } from '@nan0web/ui-cli'
		const data = [{ id: 1, name: 'Alice' }]
		console.info(data) // -> [ { id: 1, name: 'Alice' } ]
		assert.deepStrictEqual(console.output()[0][1], data)
	})

	/**
	 * @docs
	 * ### Feedback & Progress
	 */
	it('How to use Spinner?', async () => {
		//import { render, Spinner } from '@nan0web/ui-cli'
		console.info('Loading...') // -> Loading...
		assert.deepStrictEqual(console.output()[0][1], 'Loading...')
	})

	/**
	 * @docs
	 * #### Progress Bars
	 */
	it('How to use ProgressBar?', async () => {
		//import { render, ProgressBar } from '@nan0web/ui-cli'
		console.info('Progress: 100%') // -> Progress: 100%
		assert.deepStrictEqual(console.output()[0][1], 'Progress: 100%')
	})

	/**
	 * @docs
	 * ## Legacy API
	 *
	 * ### CLiInputAdapter
	 */
	it('How to request form input via CLiInputAdapter?', async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
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

		assert.deepStrictEqual(result.form.state.name, 'John Doe')
	})

	/**
	 * @docs
	 * ### Functional Utilities
	 */
	it('How to ask a question with ask()?', async () => {
		//import { ask } from "@nan0web/ui-cli"
		const result = await ask('What is your name?')
		console.info(result) // -> Alice
		assert.deepStrictEqual(console.output()[0][1], 'Alice')
	})

	/**
	 * @docs
	 * #### Execution Control
	 */
	it('How to pause code execution?', async () => {
		//import { pause } from '@nan0web/ui-cli'
		await pause(10)
		console.info('Done') // -> Done
		assert.deepStrictEqual(console.output()[0][1], 'Done')
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 * ```bash
	 * npm run play
	 * ```
	 */
	it('How to run the playground?', () => {
		assert.ok(pkg.scripts?.play)
	})

	/**
	 * @docs
	 * ## License
	 *
	 * ISC © [Check here](./LICENSE)
	 */
	it('How to check the license?', () => {
		assert.ok(pkg.license === 'ISC')
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)

	it('document is rendered', async () => {
		assert.ok(text.includes('## License'))
	})
})
