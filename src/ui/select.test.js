import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { select } from "./select.js"
import { CancelError } from "@nan0web/ui"

describe("Select utility", () => {
	const mockConsole = { info: () => {} }

	it("throws on empty options", async () => {
		await assert.rejects(
			() => select({ title: "Test", prompt: "Choose:", options: [], console: mockConsole }),
			{ message: "Options array is required and must not be empty" },
		)
	})

	it("cancels via CancelError", async () => {
		const mockAsk = () => Promise.reject(new CancelError())
		await assert.rejects(() => select({
			title: "Lang",
			prompt: "Choose:",
			options: ["en", "uk"],
			console: mockConsole,
			ask: mockAsk,
		}), CancelError)
	})

	it("handles Map options", async () => {
		const mockAsk = () => ({ value: "1", cancelled: false })
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
		let call = 0
		const mockAsk = () => {
			call++
			return call === 1 ? { value: "99", cancelled: false } : { value: "1", cancelled: false }
		}
		await select({
			title: "Lang",
			prompt: "Choose:",
			options: ["en", "uk"],
			console: mockConsole,
			ask: mockAsk,
			invalidPrompt: "Invalid, try again:",
		})
		assert.equal(call, 2)
	})
})
