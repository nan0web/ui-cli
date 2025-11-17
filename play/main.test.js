/**
 * Playground integration tests – verify that the interactive demos work as expected.
 *
 * @module play/main.test
 */

import { describe, it } from "node:test"
import assert from "node:assert"
import { PlaygroundTest } from "../src/test/index.js"

const selectDemo = [
	'Select UI‑CLI demo to run:',
	' 1) Basic Logging Demo',
	' 2) Select Prompt Demo',
	' 3) Simple UI‑CLI Demo',
	' 4) Form Input Demo',
	' 5) ← Exit',
]

/**
 * Executes the main playground script with a given environment.
 *
 * @param {Object} env - Environment variables for the child process.
 * @returns {Promise<{stdout:string,stderr:string,exitCode:number}>}
 */
async function runPlayground(env) {
	const pt = new PlaygroundTest({ ...process.env, ...env }, { includeDebugger: false })
	const result = await pt.run(["play/main.js"])
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
function cleanLines(stdout) {
	const lines = stdout.split("\n")
	// Remove the first line that is usually empty after console.clear()
	const trimmed = lines.slice(1)
	// Filter out lines that contain ANSI escape codes (e.g., the prompt)
	const cleaned = trimmed.filter(l => !/\x1b/.test(l))
	return cleaned.filter(line => line.trim() !== "") // Remove empty lines
}

describe("playground demo flow", () => {
	it("runs basic demo then exits (sequence 1,5)", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: "1,5" })

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)
		assert.equal(stderr, "", "No stderr expected")

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...selectDemo,
			"[demo]: 1",
			"Basic UI‑CLI Demo",
			"✓ Logger initialized",
			"✓ This demo simply logs messages",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})

	it("runs select demo then exits (sequence 2,3,5)", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: "2,3,5" })

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)
		assert.equal(stderr, "", "No stderr expected")

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...selectDemo,
			"[demo]: 2",
			"Select Prompt Demo",
			"Pick a colour",
			" 1) Red",
			" 2) Green",
			" 3) Blue",
			"[demo]: 3",
			"✓ You selected: Blue",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})

	it("runs UI‑CLI demo then exits (sequence 3,5)", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: "3,5" })

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)
		assert.equal(stderr, "", "No stderr expected")

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...selectDemo,
			'[demo]: 3',
			"Simple UI‑CLI Demo",
			"Starting server on port 3033",
			"Dumping build to ./dist",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})

	it("runs form demo with predefined answers then exits (sequence 4,validuser,25,2,1,5)", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: "4,validuser,25,2,1,5",
			USER_USERNAME: "initial"
		})

		assert.strictEqual(exitCode, 0, `Process exited with ${exitCode}`)
		assert.equal(stderr, "", "No stderr expected")

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...selectDemo,
			"[demo]: 4",
			"Form Demo – Using Custom Form Class",
			"Filling user form... (uses predefined sequence if set)",
			"Unique user name [initial]: validuser",
			"User age * [18]: 25",
			"Favorite color",
			" 1) Red",
			" 2) Green",
			" 3) Blue",
			"Choose (number): 2",
			"Form completed successfully!",
			"User: validuser, Age: 25, Color: Green",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 1",
			"Basic UI‑CLI Demo",
			"✓ Logger initialized",
			"✓ This demo simply logs messages",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})
})

describe("playground cancel handling", () => {
	it("cancels the first selection and then exits", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({ PLAY_DEMO_SEQUENCE: "cancel,5" })

		assert.strictEqual(exitCode, 0, `Process should exit with code 0, got ${exitCode}`)
		assert.equal(stderr, "", "No stderr output expected")

		const lines = cleanLines(stdout)

		assert.deepStrictEqual(lines, [
			...selectDemo,
			"[demo]: cancel",
			"Demo cancelled. Returning to menu...",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})

	it("cancels form demo and returns to menu (sequence 4,cancel,5)", async () => {
		const { stdout, stderr, exitCode } = await runPlayground({
			PLAY_DEMO_SEQUENCE: "4,cancel,5"  // Select form, cancel input, then exit
		})

		assert.strictEqual(exitCode, 0, `Process should exit with code 0, got ${exitCode}`)
		assert.equal(stderr, "", "No stderr expected")

		const lines = cleanLines(stdout)
		assert.deepStrictEqual(lines, [
			...selectDemo,
			"[demo]: 4",
			"Form Demo – Using Custom Form Class",
			"Filling user form... (uses predefined sequence if set)",
			"Unique user name []: cancel",
			"Form cancelled by user.",
			"==================================================",
			"Demo completed. Returning to menu...",
			"==================================================",
			...selectDemo,
			"[demo]: 5",
			"Thanks for exploring UI‑CLI demos! 🚀"
		])
	})
})
