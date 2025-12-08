import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { UiForm, FormInput } from "@nan0web/ui"
import CLiInputAdapter from "./InputAdapter.js"

/**
 * Focused tests for the predefined‑answer handling of
 * {@link CLiInputAdapter}.  They verify that the internal cursor
 * advances correctly across `requestSelect`, `requestInput` and
 * `requestForm`.
 */
describe("CLiInputAdapter – predefined answers (isolated)", () => {
	let originalEnv

	beforeEach(() => {
		originalEnv = { ...process.env }
	})

	afterEach(() => {
		process.env = originalEnv
	})

	it("requestSelect uses the first predefined answer", async () => {
		process.env.PLAY_DEMO_SEQUENCE = "2" // selects "Green"
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestSelect({
			title: "Pick a colour",
			prompt: "[db]: ",
			options: ["Red", "Green", "Blue"],
			// no console – silent output is fine for the isolated test
		})
		assert.equal(result, "Green")
	})

	it("requestSelect consumes answers sequentially", async () => {
		process.env.PLAY_DEMO_SEQUENCE = "2,3"
		const adapter = new CLiInputAdapter()
		const first = await adapter.requestSelect({
			title: "First colour",
			prompt: "[db]: ",
			options: ["Red", "Green", "Blue"],
		})
		const second = await adapter.requestSelect({
			title: "Second colour",
			prompt: "[db]: ",
			options: ["Red", "Green", "Blue"],
		})
		assert.equal(first, "Green")
		assert.equal(second, "Blue")
	})

	it("requestInput uses the next predefined answer", async () => {
		process.env.PLAY_DEMO_SEQUENCE = "John Doe"
		const adapter = new CLiInputAdapter()
		const result = await adapter.requestInput({
			prompt: "What is your name? ",
		})
		assert.equal(result, "John Doe")
	})

	it("requestForm consumes predefined answers in order", async () => {
		process.env.PLAY_DEMO_SEQUENCE = "Alice,30"
		const adapter = new CLiInputAdapter()
		const form = new UiForm({
			title: "Test Form",
			id: "test-form",
			fields: [
				new FormInput({ name: "name", label: "Name", required: true }),
				new FormInput({ name: "age", label: "Age", required: false }),
			],
		})

		const result = await adapter.requestForm(form, { silent: true })
		const data = result.form.state
		assert.equal(data.name, "Alice")
		assert.equal(data.age, "30")
	})
})
