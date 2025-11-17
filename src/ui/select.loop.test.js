import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { select } from "./select.js"
import { NoConsole } from "@nan0web/log"
import { createPredefinedInput } from "./input.js"

describe("Select utility – loop validation", () => {
	it("uses validator loop to repeat on invalid input", async () => {
		const console = new NoConsole()
		const result = await select({
			title: "Choose Language",
			prompt: "Pick: ",
			options: ["en", "uk"],
			console,
			ask: createPredefinedInput(["99", "1"], console, ["0"]),
			invalidPrompt: "Invalid, try again: ",
		})
		assert.equal(result.value, "en")
		assert.deepStrictEqual(console.output("info").map(a => a[1]), [
			"Choose Language",
			" 1) en",
			" 2) uk",
			"Pick: 99\n",
			"Invalid, try again: 1\n"
		])
	})
})
