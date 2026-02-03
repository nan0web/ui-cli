/**
 * Playground integration tests – verify that the interactive demos work as expected.
 *
 * @module play/main.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import Logger from '@nan0web/log'
import { PlaygroundTest } from '../src/test/index.js'

const selectDemo = [
	'Select UI‑CLI demo to run:',
	' 1) Basic Logging Demo',
	' 2) Select Prompt Demo',
	' 3) Simple UI‑CLI Demo',
	' 4) Form Input Demo',
	' 5) UiMessage Demo',
	' 6) Table Filtering Demo',
	' 7) Table Filtering (Instant)',
	' 8) Autocomplete Search Demo',
	' 9) Long List Scrolling Demo',
	' 10) Advanced Form Demo',
	' 11) ← Exit',
]

const logo = Logger.style(Logger.LOGO, { color: Logger.MAGENTA })
	.split('\n')
	.filter((line) => line.trim() !== '')

/**
 * Executes the main playground script with a given environment.
 *
 * @param {Object} env - Environment variables for the child process.
 * @returns {Promise<{stdout:string,stderr:string,exitCode:number}>}
 */
async function runPlayground(env) {
	const pt = new PlaygroundTest({ ...process.env, ...env }, { includeDebugger: false, feedStdin: false })
	const result = await pt.run(['play/main.js'])
	return result
}

/**
 * Helper to clean stdout lines:
 *   – drops the first empty line caused by `console.clear()`
 *   – removes any line containing ANSI escape sequences (prompt artefacts)
 *
 * @param {string} stdout
 * @returns {string[]}
 */
const cleanLines = (stdout) => stdout.split('\n').filter((line) => line.trim() !== '')

describe('playground demo flow', () => {
	it('runs basic demo then exits (sequence 1,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '1,11' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 1',
			'Basic UI‑CLI Demo',
			'✓ Logger initialized',
			'✓ This demo simply logs messages',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('runs select demo then exits (sequence 2,3,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '2,3,11' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 2',
			'Select Prompt Demo',
			'Pick a colour',
			' 1) Red',
			' 2) Green',
			' 3) Blue',
			'[demo]: 3',
			'✓ You selected: Blue',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('runs UI‑CLI demo then exits (sequence 3,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: '3,11' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 3',
			'Simple UI‑CLI Demo',
			'Starting server on port 3033',
			'Dumping build to ./dist',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('runs form demo with predefined answers then exits (sequence 4,validuser,25,2,1,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '4,validuser,25,2,1,11',
			USER_USERNAME: 'initial',
		})

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 4',
			'Form Demo – Using Custom Form Class',
			'Filling user form... (uses predefined sequence if set)',
			'Unique user name [initial]: validuser',
			'User age * [18]: 25',
			'Favorite color',
			' 1) Red',
			' 2) Green',
			' 3) Blue',
			'Choose (number): 2',
			'Form completed successfully!',
			'User: validuser, Age: 25, Color: Green',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 1',
			'Basic UI‑CLI Demo',
			'✓ Logger initialized',
			'✓ This demo simply logs messages',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('runs ui‑message demo with predefined answers then exits (sequence 5,alice,30,2,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '5,alice,30,2,11',
		})

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 5',
			'UiMessage Demo – Schema‑driven Form',
			'User name *: alice',
			'User age *: 30',
			'Favorite colour',
			' 1) Red',
			' 2) Green',
			' 3) Blue',
			'Choose (number): 2',
			'Form completed!',
			`Result → {"username":"alice","age":30,"color":"Green"}`,
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('runs autocomplete demo then exits (sequence 8,Ukraine,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '8,Ukraine,11',
		})

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		// We check for key messages because autocomplete output depends on terminal state
		assert.ok(lines.some(l => l.includes('Autocomplete Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('Ukraine')), 'Output should contain selected country')
		assert.ok(lines.some(l => l.includes('selected: Ukraine')), 'Output should confirm selection')
	})

	it('runs advanced form demo then exits (sequence 10,user,pass,(123) 456-7890,y,Admin,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '10,user,pass,(123) 456-7890,y,Admin,11',
		})

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr output expected')
		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.ok(lines.some(l => l.includes('Advanced Form Demo')), 'Output should contain demo title')
		assert.ok(lines.some(l => l.includes('submitted')), 'Output should confirm submission')
		assert.ok(lines.some(l => l.includes('********')), 'Output should contain masked password')
		assert.ok(lines.some(l => l.includes('"roles":')), 'Output should contain roles')
		assert.ok(lines.some(l => l.includes('Admin')), 'Output should contain selected role')
	})
})

describe('playground cancel handling', () => {
	it('cancels the first selection and exits immediately (Esc in main menu)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: 'cancel' })

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr expected')
		assert.strictEqual(exitCode, 0, `Process should exit with code 0, got ${exitCode}`)

		const lines = cleanLines(stdout)

		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: cancel',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})

	it('cancels form demo and returns to menu (sequence 4,cancel,11)', async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: '4,cancel,11',
		})

		assert.deepStrictEqual(stderr.split('\n'), [''], 'No stderr expected')
		assert.strictEqual(exitCode, 0, `Process should exit with code 0, got ${exitCode}`)

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...logo,
			...selectDemo,
			'[demo]: 4',
			'Form Demo – Using Custom Form Class',
			'Filling user form... (uses predefined sequence if set)',
			'Unique user name []: cancel',
			'Selection cancelled. Returning to menu...',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			...selectDemo,
			'[demo]: 11',
			'Thanks for exploring UI‑CLI demos! 🚀',
		])
	})
})
