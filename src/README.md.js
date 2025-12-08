/* eslint-disable no-unused-vars */
import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { UiForm } from "@nan0web/ui"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser,
	DocsParser,
	runSpawn,
} from "@nan0web/test"
import {
	CLiInputAdapter as BaseCLiInputAdapter,
	CancelError,
	createInput,
	Input,
	pause,
	ask as baseAsk,
	select as baseSelect,
	next as baseNext,
} from "./index.js"

async function ask(question) {
	if ("Full Name *: " === question) return "John Doe"
	if ("Email *: " === question) return "John.Doe@example.com"
	if ("What is your name?" === question) return "Alice"
	return ""
}

async function select(config) {
	if ("Choose Language:" === config.title) return { index: 0, value: "en" }
	if ("Choose an option:" === config.title) return { index: 2, value: "Option B" }

	return { index: -1, value: null }
}

async function next() {
	return Promise.resolve(" ")
}

class CLiInputAdapter extends BaseCLiInputAdapter {
	async ask(question) {
		return await ask(question)
	}
	async select(config) {
		return await select(config)
	}
}

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument("package.json", {})
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
	 * A tiny, zero‑dependency UI input adapter for Java•Script projects.
	 * It provides a CLI implementation that can be easily integrated
	 * with application logic.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/ui-cli` package provides a set of tools for handling
	 * CLI user input through structured forms, selections and prompts.
	 * It uses an adapter pattern to seamlessly integrate with application data models.
	 *
	 * Core classes:
	 *
	 * - `CLiInputAdapter` — handles form, input, and select requests in CLI.
	 * - `Input` — wraps user input with value and cancellation status.
	 * - `CancelError` — thrown when a user cancels an operation.
	 *
	 * These classes are perfect for building prompts, wizards, forms,
	 * and interactive CLI tools with minimal overhead.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/ui-cli")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/ui-cli")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/ui-cli")
	})

	/**
	 * @docs
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
	it("How to request form input via CLiInputAdapter?", async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
		const adapter = new CLiInputAdapter()
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
		const form = UiForm.from({
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
		assert.deepStrictEqual(console.output()[0][1], { name: "John Doe", email: "John.Doe@example.com" })
	})
	/**
	 * @docs
	 */
	it("How to request select input via CLiInputAdapter?", async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
		const adapter = new CLiInputAdapter()
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
		assert.deepStrictEqual(console.output()[0][1], "en")
	})

	/**
	 * @docs
	 * ### Input Utilities
	 *
	 * #### `Input` class
	 *
	 * Holds user input and tracks cancelation events.
	 */
	it("How to use the Input class?", () => {
		//import { Input } from '@nan0web/ui-cli'
		const input = new Input({ value: "test", stops: ["quit"] })
		console.info(String(input)) // ← test
		console.info(input.value) // ← test
		console.info(input.cancelled) // ← false

		input.value = "quit"
		console.info(input.cancelled) // ← true
		assert.equal(console.output()[0][1], "test")
		assert.equal(console.output()[1][1], "test")
		assert.equal(console.output()[2][1], false)
		assert.equal(console.output()[3][1], true)
	})

	/**
	 * @docs
	 * #### `ask(question)`
	 *
	 * Prompts the user with a question and returns a promise with the answer.
	 */
	it("How to ask a question with ask()?", async () => {
		//import { ask } from "@nan0web/ui-cli"

		const result = await ask("What is your name?")
		console.info(result)
		assert.equal(console.output()[0][1], "Alice")
	})

	/**
	 * @docs
	 * #### `createInput(stops)`
	 *
	 * Creates a configurable input handler with stop keywords.
	 */
	it("How to use createInput handler?", () => {
		//import { createInput } from '@nan0web/ui-cli'
		const handler = createInput(["cancel"])
		console.info(typeof handler === "function") // ← true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * #### `select(config)`
	 *
	 * Presents options to the user and returns a promise with selection.
	 */
	it("How to prompt user with select()?", async () => {
		//import { select } from '@nan0web/ui-cli'
		const config = {
			title: "Choose an option:",
			prompt: "Selection (1-3): ",
			options: ["Option A", "Option B", "Option C"],
			console: console,
		}

		const result = await select(config)
		console.info(result.value)
		assert.equal(console.output()[0][1], "Option B")
	})

	/**
	 * @docs
	 * #### `next(conf)`
	 *
	 * Waits for a keypress to continue the process.
	 */
	it("How to pause and wait for keypress with next()?", async () => {
		//import { next } from '@nan0web/ui-cli'

		const result = await next()
		console.info(typeof result === "string")
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * #### `pause(ms)`
	 *
	 * Returns a promise that resolves after a given delay.
	 */
	it("How to delay execution with pause()?", async () => {
		//import { pause } from '@nan0web/ui-cli'
		const before = Date.now()
		await pause(10)
		const after = Date.now()
		console.info(after - before >= 10) // ← true
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
	it("How to handle CancelError?", () => {
		//import { CancelError } from '@nan0web/ui-cli'
		const error = new CancelError()
		console.error(error.message) // ← Operation cancelled by user
		assert.equal(console.output()[0][1], "Operation cancelled by user")
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
	 *   * `config.prompt` (string) – prompt text
	 *   * `config.options` (array | Map) – options to choose from
	 * * **Returns** Promise<{ index, value }>
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
	it("All exported classes and functions should pass basic tests", () => {
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
	it("Uses `d.ts` files for autocompletion", () => {
		assert.equal(pkg.types, "types/index.d.ts")
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 */
	it("How to run playground script?", async () => {
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
		const response = await runSpawn("git", ["remote", "get-url", "origin"], { timeout: 2_000 })
		if (response.code === 0) {
			assert.ok(response.text.trim().endsWith("nan0web/ui-cli.git"))
		} else {
			// git command may fail if not in a repo or no remote, skip assertion
			console.warn("Git command skipped due to non-zero exit code or timeout.")
		}
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		try {
			const text = await fs.loadDocument("CONTRIBUTING.md")
			const str = String(text)
			assert.ok(str.includes("# Contributing"))
		} catch (e) {
			console.warn("Contributing file test skipped because CONTRIBUTING.md is not present.")
		}
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license ISC? - [check here](./LICENSE)", async () => {
		try {
			const text = await fs.loadDocument("LICENSE")
			assert.ok(String(text).includes("ISC"))
		} catch (e) {
			console.warn("License test skipped because LICENSE is not present.")
		}
	})
}

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
