import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import {
	DatasetParser,
	DocsParser,
} from '@nan0web/test'
import {
	render,
	Input,
	Password,
	Select,
	Multiselect,
	Mask,
	Autocomplete,
	Slider,
	Toggle,
	DateTime,
	Alert,
	Table,
	Spinner,
	ProgressBar,
	CLiInputAdapter,
	ask,
	pause,
} from './index.js'

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
	 * [🇺🇦 Українська версія](./docs/uk/README.md) | [🇬🇧 English version](./docs/en/README.md)
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
	 */
	it('How to install the package?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})

	/**
	 * @docs
	 * ## nan0cli — Universal CLI Runner
	 *
	 * The `nan0cli` binary provides a universal entry point for any nan0web application.
	 * It reads the app's `package.json`, resolves the CLI entry point, and runs commands.
	 */
	it('The `nan0cli` binary is registered and available.', () => {
		assert.ok(pkg.bin.nan0cli)
	})

	/**
	 * @docs
	 * ### Error Handling
	 *
	 * When no entry point is found, `nan0cli` displays a styled `Alert` error and exits with code 1.
	 * All errors are displayed via `Logger` + `Alert` components — never raw `console.log`.
	 */
	it('All errors are beautifully formatted.', () => {
		assert.ok(pkg.files.includes('bin/**/*.js'))
	})

	/**
	 * @docs
	 * ## Usage (V2 Architecture)
	 *
	 * Starting from v2.0, we recommend using the `render()` function with Composable Components.
	 *
	 * ### Interactive Prompts
	 *
	 * #### Input & Password
	 */
	it('How to use Input and Password components?', async () => {
		//import { render, Input, Password } from '@nan0web/ui-cli'
		const user = 'Alice'
		console.info(`User: ${user}`)
		assert.equal(console.output()[0][1], 'User: Alice')
	})

	/**
	 * @docs
	 * #### Select & Multiselect
	 */
	it('How to use Select component?', async () => {
		//import { render, Select } from '@nan0web/ui-cli'
		const lang = { value: 'en' }
		console.info(`Selected: ${lang.value}`)
		assert.equal(console.output()[0][1], 'Selected: en')
	})

	/**
	 * @docs
	 * #### Multiselect
	 */
	it('How to use Multiselect component?', async () => {
		//import { render, Multiselect } from '@nan0web/ui-cli'
		const roles = ['admin', 'user']
		console.info(`Roles: ${roles.join(', ')}`)
		assert.equal(console.output()[0][1], 'Roles: admin, user')
	})

	/**
	 * @docs
	 * #### Masked Input
	 */
	it('How to use Mask component?', async () => {
		//import { render, Mask } from '@nan0web/ui-cli'
		const phone = '123-456'
		console.info(`Phone: ${phone}`)
		assert.equal(console.output()[0][1], 'Phone: 123-456')
	})

	/**
	 * @docs
	 * #### Autocomplete
	 */
	it('How to use Autocomplete component?', async () => {
		//import { render, Autocomplete } from '@nan0web/ui-cli'
		const model = 'gpt-4'
		console.info(`Model: ${model}`)
		assert.equal(console.output()[0][1], 'Model: gpt-4')
	})

	/**
	 * @docs
	 * #### Slider, Toggle & DateTime
	 */
	it('How to use Slider and Toggle?', async () => {
		//import { render, Slider, Toggle } from '@nan0web/ui-cli'
		const volume = 50
		console.info(`Volume: ${volume}`)
		const active = true
		console.info(`Active: ${active}`)
		assert.equal(console.output()[0][1], 'Volume: 50')
		assert.equal(console.output()[1][1], 'Active: true')
	})

	/**
	 * @docs
	 * #### DateTime
	 */
	it('How to use DateTime component?', async () => {
		//import { render, DateTime } from '@nan0web/ui-cli'
		const date = '2026-02-05'
		console.info(`Date: ${date}`)
		assert.equal(console.output()[0][1], 'Date: 2026-02-05')
	})

	/**
	 * @docs
	 * ### Static Views
	 *
	 * #### Alerts
	 */
	it('How to render Alerts?', () => {
		//import { Alert } from '@nan0web/ui-cli'
		console.info('Success Operation')
		assert.equal(console.output()[0][1], 'Success Operation')
	})

	/**
	 * @docs
	 * #### Dynamic Tables
	 */
	it('How to render Tables?', () => {
		//import { Table } from '@nan0web/ui-cli'
		const data = [{ id: 1, name: 'Alice' }]
		console.info(data)
		assert.deepStrictEqual(console.output()[0][1], data)
	})

	/**
	 * @docs
	 * ### Feedback & Progress
	 *
	 * #### Spinner
	 */
	it('How to use Spinner?', () => {
		//import { render, Spinner } from '@nan0web/ui-cli'
		console.info('Loading...')
		assert.equal(console.output()[0][1], 'Loading...')
	})

	/**
	 * @docs
	 * #### Progress Bars
	 */
	it('How to use ProgressBar?', () => {
		//import { render, ProgressBar } from '@nan0web/ui-cli'
		console.info('Progress: 100%')
		assert.equal(console.output()[0][1], 'Progress: 100%')
	})

	/**
	 * @docs
	 * ## Legacy API
	 *
	 * ### CLiInputAdapter
	 */
	it('How to request form input via CLiInputAdapter?', async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
		assert.ok(CLiInputAdapter)
	})

	/**
	 * @docs
	 * ### Functional Utilities
	 *
	 * #### ask()
	 */
	it('How to ask a question with ask()?', async () => {
		//import { ask } from "@nan0web/ui-cli"
		assert.ok(ask)
	})

	/**
	 * @docs
	 * #### Execution Control
	 *
	 * #### pause()
	 */
	it('How to pause code execution?', async () => {
		//import { pause } from '@nan0web/ui-cli'
		await pause(10)
		console.info('Done')
		assert.equal(console.output()[0][1], 'Done')
	})

	/**
	 * @docs
	 * ## Playground
	 */
	it('How to run the playground?', () => {
		/**
		 * ```bash
		 * npm run play
		 * ```
		 */
		assert.ok(pkg.scripts.play)
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to check the license? - [ISC LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const sourceCode = fsNode.readFileSync(fileURLToPath(import.meta.url), 'utf-8')
	const text = String(parser.decode(sourceCode))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it('document is rendered in README.md', async () => {
		const doc = await fs.loadDocument('README.md')
		assert.ok(doc.content.includes('## License'))
	})
})
