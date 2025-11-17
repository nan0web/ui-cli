import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { select } from "./select.js"
import { CancelError } from "@nan0web/ui"
import { createPredefinedInput } from "./input.js"
import { NoConsole } from "@nan0web/log"

describe("Select utility", () => {
	const mockConsole = { info: () => { } }

	it("throws on empty options", async () => {
		await assert.rejects(
			() => select({ title: "Test", prompt: "Choose:", options: [], console: mockConsole }),
			{ message: "Options array is required and must not be empty" },
		)
	})

	it("cancels via CancelError", async () => {
		const mockAsk = () => Promise.reject(new CancelError())
		await assert.rejects(
			() =>
				select({
					title: "Lang",
					prompt: "Choose:",
					options: ["en", "uk"],
					console: mockConsole,
					ask: mockAsk,
				}),
			CancelError,
		)
	})

	it("handles Map options", async () => {
		// mockAsk returns a resolved object matching the expected shape
		const mockAsk = () => Promise.resolve({ value: "1", cancelled: false })
		const result = await select({
			title: "Lang",
			prompt: "Choose:",
			options: new Map([["en", "English"], ["uk", "Ukrainian"]]),
			console: mockConsole,
			ask: mockAsk,
		})
		assert.equal(result.value, "en")
	})

	it("loops on invalid input", async () => {
		const console = new NoConsole()
		const result = await select({
			title: "Lang",
			prompt: "Choose: ",
			options: ["en", "uk"],
			console,
			ask: createPredefinedInput(["99", "1"], console, ["0"]),
			invalidPrompt: "Invalid, try again: ",
		})
		assert.equal(result.value, "en")
		assert.deepStrictEqual(console.output("info").map(a => a[1]), [
			"Lang",
			" 1) en",
			" 2) uk",
			"Choose: 99\n",
			"Invalid, try again: 1\n"
		])
	})
})
