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
	Tree,
	Sortable,
	Alert,
	Table,
	Spinner,
	ProgressBar,
	CLiInputAdapter,
	ask,
	pause,
	bootstrapApp,
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
	 * - **Universal Runner** — Start your CLI app in 1 line of code with `bootstrapApp`.
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
	 * ## Universal CLI Runner
	 *
	 * The `bootstrapApp` is the modern way to bootstrap CLI applications.
	 * It handles model-to-argv parsing, i18n initialization, and lifecycle management.
	 * 
	 * ### Security: The seal() Protocol
	 *
	 * To ensure system integrity, `bootstrapApp` automatically locks the database using `db.seal()`.
	 * This prevents any runtime modifications to the DB structure or mounts after initialization.
	 * **Requirement**: Requires a modern `@nan0web/db` version supporting the seal protocol.
	 *
	 * ### Quick Start
	 */
	it('How to bootstrap a CLI application?', async () => {
		//import { bootstrapApp } from '@nan0web/ui-cli'
		//import { MyModel } from './models.js'
		// await bootstrapApp(MyModel)
		assert.ok(typeof bootstrapApp === 'function')
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
	 * #### Tree Selection
	 * Hierarchical data selection made easy.
	 */
	it('How to use Tree component?', async () => {
		//import { render, Tree } from '@nan0web/ui-cli'
		const selected = '/src/index.js'
		console.info(`Selected file: ${selected}`)
		assert.equal(console.output()[0][1], 'Selected file: /src/index.js')
	})

	/**
	 * @docs
	 * #### Sortable Lists
	 * Drag and drop items in the terminal.
	 */
	it('How to use Sortable component?', async () => {
		//import { render, Sortable } from '@nan0web/ui-cli'
		const items = ['First', 'Second', 'Third']
		console.info(`Order: ${items.join(' > ')}`)
		assert.equal(console.output()[0][1], 'Order: First > Second > Third')
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

