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
async function runPlayground(env) {
	const pt = new PlaygroundTest({ ...process.env, ...env }, { includeDebugger: false, feedStdin: true })
	const result = await pt.run(['play/main.js'])
	return result
}

/**
 * Helper to clean stdout lines:
 *   – drops the first empty line caused by `console.clear()`
 *   – removes any line containing ANSI escape sequences (prompt artefacts)
 *   – removes empty lines
 *
 * @param {string} stdout
 * @returns {string[]}
 */
const cleanLines = (stdout) => stdout.split('\n').filter((line) => line.trim() !== '')

describe('playground demo flow', () => {
	it('runs basic demo then exits (sequence 1,19)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '1,19' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Basic Logging')), 'Should show demo title')
		assert.ok(lines.some(l => l.includes('Logger initialized')), 'Should show log message')
		assert.ok(lines.some(l => l.includes('Thanks for exploring')), 'Should show exit message')
	})

	it('runs select demo then exits (sequence 2,3,19)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '2,3,19' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Select Prompt Demo')), 'Should run select demo')
		assert.ok(lines.some(l => l.includes('selected: Blue')), 'Should confirm color selection')
	})

	it('runs UI‑CLI demo then exits (sequence 3,19)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '3,19' })

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Simple Demo')), 'Should show demo title')
	})

	it('runs form demo with predefined answers then exits', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '4,validuser,25,2,19',
			USER_USERNAME: 'initial',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Form Demo')), 'Should run form demo')
		assert.ok(lines.some(l => l.includes('User: validuser')), 'Should show submitted data')
	})

	it('runs ui‑message demo with predefined answers then exits', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '5,alice,30,2,19',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('UiMessage Demo')), 'Should run ui-message demo')
		assert.ok(lines.some(l => l.includes('Result →')), 'Should show JSON result')
	})

	it('runs view components demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '6,a,19',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('View Components Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('BADGES')), 'Output should contain section header')
	})

	it('runs nav components demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '7,a,19',
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Navigation Components Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('BREADCRUMBS')), 'Output should contain section header')
	})

	it('runs tree view demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '8,package.json,src,play,a,19',
		})

		if (exitCode !== 0) console.error(stdout)
		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Tree View Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('You selected')), 'Output should indicate flow completion')
		// In simulation, we print "Select: package.json" (from mock input) and then result
		assert.ok(lines.some(l => l.includes('package.json')), 'Output should contain selected file')
	})

	it('runs autocomplete demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '11,Ukraine,19', // Updated index 11
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Autocomplete Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('Ukraine')), 'Output should contain selected country')
	})

	it('runs advanced form demo then exits', async () => {
		const { stdout, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '13,user,pass,(123) 456-7890,y,Admin,19', // Updated index 13
		})

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Advanced Form Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('submitted')), 'Output should confirm submission')
	})
})

describe('playground cancel handling', () => {
	it('cancels the first selection and exits immediately', async () => {
		const { stdout, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '19' }) // Exit directly

		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Thanks for exploring')), 'Should show exit message')
	})

	it('cancels form demo and returns to menu', async () => {
		// 4: Form Demo, cancel: stop form, 18: Exit
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '4,cancel,19',
		})

		if (exitCode !== 0) {
			console.error('DEBUG STDERR:', stderr)
		}
		assert.strictEqual(exitCode, 0)
		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Selection cancelled')), 'Should report cancellation')
	})
})
