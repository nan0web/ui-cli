import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createInput } from "./input.js"

describe("ask (createInput) with predefined answer", () => {
	it("returns the predefined answer as Input value", async () => {
		const predefined = "testAnswer"
		const handler = createInput([], predefined) // stops empty, predef set
		const result = await handler("Question?") // loop defaults to false
		assert.equal(result.value, predefined)
		assert.equal(result.cancelled, false)
	})
})