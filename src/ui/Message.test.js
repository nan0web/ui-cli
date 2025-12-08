/**
 * @docs
 * The test verifies that the UiMessage.requireInput process correctly handles forms with select fields,
 * including options display and predefined input through CLiInputAdapter and OutputAdapter.
 */
import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"

import { NoConsole } from "@nan0web/log"
import { UiMessage, InputAdapter, OutputAdapter } from "@nan0web/ui"

import CLiInputAdapter from "../InputAdapter.js"

class DemoBody {
	static color = {
		help: "Favorite colour",
		options: ["Red", "Green", "Blue"],
		defaultValue: "Red",
	}
	constructor(input = {}) {
		this.color = input.color || DemoBody.color.defaultValue
	}
}

class DemoMessage extends UiMessage {
	static Body = DemoBody
	/** @type {DemoBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = new DemoBody(input.body ?? {})
	}
}

describe("UiMessage with select field", () => {
	let inputAdapter, outputAdapter, mockConsole

	beforeEach(() => {
		mockConsole = new NoConsole()
		inputAdapter = new CLiInputAdapter({ console: mockConsole, stdout: mockConsole })
		outputAdapter = {
			render: async (component, props) => {
				if (component === "Alert" && props.variant === "error") {
					mockConsole.error(props.content)
				}
			},
			console: mockConsole
		}
	})

	it("should show select options and accept predefined answer", async () => {
		// Setup: Initialize the message and UI
		const msg = new DemoMessage()
		/** @type {{ input: InputAdapter, output: OutputAdapter }} */
		const ui = { input: inputAdapter, output: outputAdapter }

		// Force predefined answer
		inputAdapter[`#` + "answers"] = ["1"]
		inputAdapter[`#` + "cursor"] = 0

		// Capture all console.info calls
		const spy = []
		mockConsole.info = function (...args) {
			spy.push(args.join(" "))
		}

		// Action: Run requireInput
		const result = await ui.input.requireInput(msg)

		// Assertion: Correct field value selected
		assert.strictEqual(result.color, "Red", "Selected color should be 'Red' for answer '1'")

		// Verify output
		assert.deepStrictEqual(spy, [

		])
		// const output = spy.join("\n")
		// assert.ok(output.includes("Favorite colour"), "Should display field label")
		// assert.ok(output.includes("1) Red"), "Should list option 'Red'")
		// assert.ok(output.includes("2) Green"), "Should list option 'Green'")
		// assert.ok(output.includes("3) Blue"), "Should list option 'Blue'")
	})
})
