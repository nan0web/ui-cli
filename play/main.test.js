/**
 * Playground integration tests – verify that the interactive demos work as expected.
 *
 * @module play/main.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import Logger from '@nan0web/log'
import { PlaygroundTest } from '../src/test/index.js'

/**
 * Executes the main playground script with a given environment.
 *
 * @param {Object} env - Environment variables for the child process.
 * @returns {Promise<{stdout:string,stderr:string,exitCode:number}>}
 */
/**
 * Executes the main playground script with a given environment and arguments.
 *
 * @param {string} demo - Demo name to run.
 * @param {string} lang - Language code.
 * @param {Object} [env={}] - Additional environment variables.
 * @returns {Promise<{stdout:string,stderr:string,exitCode:number}>}
 */
async function runPlayground(demo, lang, env = {}) {
	const pt = new PlaygroundTest(
		{ ...process.env, ...env },
		{ includeDebugger: false, feedStdin: true }
	)
	const result = await pt.run(['play/main.js', `--demo=${demo}`, `--lang=${lang}`])
	return result
}

/**
 * Removes ANSI escape codes.
 */
function stripAnsi(str) {
	return str.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, '')
}

/**
 * Helper to clean stdout lines:
 *   – drops the first empty line caused by `console.clear()`
 *   – removes ANSI symbols
 *   – removes empty lines
 *
 * @param {string} stdout
 * @returns {string[]}
 */
const cleanLines = (stdout) =>
	stripAnsi(stdout)
		.split('\n')
		.filter((line) => line.trim() !== '')

describe('playground demo flow', () => {
	it('runs basic demo then exits', async () => {
		const { stdout, stderr, exitCode } = await runPlayground('basic', 'en')

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('Basic Logging')),
			'Should show demo title'
		)
		assert.ok(
			lines.some((l) => l.includes('Logger initialized')),
			'Should show log message'
		)
	})

	it('runs select demo then exits', async () => {
		const { stdout, stderr, exitCode } = await runPlayground('select', 'en', {
			PLAY_DEMO_SEQUENCE: '3',
		})

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('Select Prompt Demo')),
			'Should run select demo'
		)
		assert.ok(
			lines.some((l) => l.includes('selected: Blue')),
			'Should confirm color selection'
		)
	})

	it('runs simple demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('ui-demo', 'en')

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.toLowerCase().includes('demo')),
			'Should show demo'
		)
	})

	it('runs form demo with predefined answers then exits', async () => {
		const { stdout, exitCode } = await runPlayground('form', 'en', {
			PLAY_DEMO_SEQUENCE: 'validuser,25,2',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('Form Demo')),
			'Should run form demo'
		)
		assert.ok(
			lines.some((l) => l.includes('User: validuser')),
			'Should show submitted data'
		)
	})

	it('runs ui‑message demo with predefined answers then exits', async () => {
		const { stdout, exitCode } = await runPlayground('ui-message', 'en', {
			PLAY_DEMO_SEQUENCE: 'alice,30,2',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('UiMessage Demo')),
			'Should run ui-message demo'
		)
		assert.ok(
			lines.some((l) => l.includes('Result')),
			'Should show result'
		)
	})

	it('runs view components demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('view', 'en', {
			PLAY_DEMO_SEQUENCE: 'a',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('View Components Demo')),
			'Output should contain demo title'
		)
		assert.ok(
			lines.some((l) => l.includes('BADGES')),
			'Output should contain section header'
		)
	})

	it('runs nav components demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('nav', 'en', {
			PLAY_DEMO_SEQUENCE: 'a',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(
			lines.some((l) => l.includes('Navigation Components Demo')),
			'Output should contain demo title'
		)
		assert.ok(
			lines.some((l) => l.includes('BREADCRUMBS')),
			'Output should contain section header'
		)
	})

	it('runs tree view demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('tree', 'en', {
			PLAY_DEMO_SEQUENCE: 'package.json',
		})

		assert.strictEqual(exitCode, 0)
		const clean = stripAnsi(stdout).toLowerCase()
		assert.ok(clean.includes('tree'), 'Output should contain demo title')
		assert.ok(
			clean.includes('select') || clean.includes('chosen') || clean.includes('package.json'),
			'Output should indicate completion'
		)
	})

	it('runs autocomplete demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('autocomplete', 'en', {
			PLAY_DEMO_SEQUENCE: 'Ukraine',
		})

		assert.strictEqual(exitCode, 0)
		const clean = stripAnsi(stdout).toLowerCase()
		assert.ok(clean.includes('autocomplete'), 'Output should contain demo title')
		assert.ok(clean.includes('ukraine'), 'Output should contain selected country')
	})

	it('runs advanced form demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground('advanced-form', 'en', {
			PLAY_DEMO_SEQUENCE: 'user,pass,1234567890,30,y,y,1',
		})

		assert.strictEqual(exitCode, 0)
		const clean = stripAnsi(stdout).toLowerCase()
		assert.ok(clean.includes('advanced form'), 'Output should contain demo title')
		assert.ok(clean.includes('submitted'), 'Output should confirm submission')
	})

	it('runs v2 components demo', async () => {
		const { stdout, exitCode } = await runPlayground('v2', 'en', {
			PLAY_DEMO_SEQUENCE: 'UserV2,12345,y,y,1,,Ukraine,75,0671234567,2026-02-07,package.json,',
		})

		assert.strictEqual(exitCode, 0)
		const clean = stripAnsi(stdout).toLowerCase()
		assert.ok(clean.includes('v2'), 'Output should contain demo title')
		assert.ok(clean.includes('setup complete'), 'Output should confirm completion')
	})
})

describe('playground cancel handling', () => {
	it('cancels direct demo execution and exits', async () => {
		const { stdout, exitCode } = await runPlayground('form', 'en', {
			PLAY_DEMO_SEQUENCE: 'cancel',
		})

		assert.strictEqual(exitCode, 0)
		const clean = stripAnsi(stdout).toLowerCase()
		assert.ok(clean.includes('cancel'), 'Should report cancellation')
	})
})
