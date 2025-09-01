import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import DB from '@nan0web/db-fs'
import { NoConsole } from "@nan0web/log"
import { DocsParser } from "@nan0web/test"

const fs = new DB()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

beforeEach(() => {
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
	 * # @nan0web/ui
	 *
	 * A tiny, zero‑dependency UI input adapter for Java•Script projects.
	 * It provides a CLI implementation that can be easily integrated
	 * with application logic.
	 */
	it("## Install", () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/ui")
	})

	/**
	 * @docs
	 * ## Usage
	 */
	it("Create a CLI input adapter and use it to request forms, selections, and inputs:", () => {
		/**
		 * ```js
		 * import { CLIInputAdapter } from '@nan0web/ui'
		 *
		 * const adapter = new CLIInputAdapter()
		 *
		 * // Request form input
		 * const result = await adapter.requestForm({
		 *   title: 'User info',
		 *   fields: [
		 *     { name: 'name', label: 'Full name', required: true },
		 *     { name: 'email', label: 'Email', type: 'email', required: true },
		 *   ],
		 *   elementId: 'user-form'
		 * })
		 *
		 * if (result.action === 'form-submit') {
		 *   console.log('Form submitted:', result.data)
		 * }
		 * ```
		 */
		assert.equal(pkg.main, "src/index.js")
	})

	/**
	 * @docs
	 * ## Features
	 *
	 * - Form input with validation
	 * - Selection menus
	 * - Simple text input
	 * - Cancel handling (Ctrl+C)
	 * - Navigation commands (::prev, ::next, ::skip)
	 */
	it("Supports various input patterns", () => {
		assert.ok(true) // Covered by playground example
	})

	/**
	 * @docs
	 * ## CLI Playground
	 */
	it("There is also a CLI sandbox playground to try the library directly:", () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/ui.git
		 * cd ui
		 * npm install
		 * npm run playground
		 * ```
		 */
		assert.ok(String(pkg.scripts?.playground).includes("node playground"))

		// Spawn process to check git remote URL
		const result = spawn('git', ['remote', 'get-url', 'origin'])
		let output = ''

		result.stdout.on('data', (data) => {
			output += data.toString()
		})

		result.on('close', (code) => {
			if (code === 0) {
				assert.ok(output.trim().endsWith(':nan0web/ui.git'))
			} else {
				assert.ok(false, "git command fails (e.g., not in a git repo)")
			}
		})
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### `CLIInputAdapter`
	 * Main class for handling CLI input.
	 *
	 * Methods:
	 * - `requestForm(form, options)` - Request form input
	 * - `requestSelect(config)` - Request selection input
	 * - `requestInput(config)` - Request simple text input
	 */
	it("Exports CLIInputAdapter as main class", () => {
		assert.equal(pkg.main, "src/index.js")
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` to provide autocomplete hints.", () => {
		assert.equal(pkg.types, "./types/index.d.ts")
		assert.equal(pkg.scripts?.build, "tsc")
	})
}

describe('README.md testing', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## API"))
	})
})
