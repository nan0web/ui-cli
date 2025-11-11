import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { UIForm, FormInput } from "@nan0web/ui"
import { CancelError } from "@nan0web/ui/core"
import CLIInputAdapter from "./InputAdapter.js"

describe("CLIInputAdapter", () => {
	let adapter

	beforeEach(() => {
		adapter = new CLIInputAdapter()
		adapter.ask = async (q) => {
			if (q.includes("Email")) return "test@example.com"
			if (q.includes("*")) return "John Doe"
			return ""
		}
		adapter.select = async () => ({ index: 0, value: "en" })
	})

	it("should create instance", () => {
		assert.ok(adapter instanceof CLIInputAdapter)
	})

	it("should handle form submission", async () => {
		const form = new UIForm({
			title: "Test Form",
			id: "test-form",
			fields: [
				new FormInput({
					name: "email",
					label: "Email",
					required: true,
				}),
			],
		})
		const result = await adapter.requestForm(form, { silent: true })
		assert.equal(result.body.action, "form-submit")
		assert.equal(result.form.state.email, "test@example.com")
	})

	it("should handle form cancellation", async () => {
		const form = new UIForm({
			title: "Test Form",
			id: "test-form",
			fields: [
				new FormInput({
					name: "name",
					label: "Name",
					required: true,
				}),
			],
		})
		adapter.ask = async () => ""
		const result = await adapter.requestForm(form, { silent: true })
		assert.equal(result.body.action, "form-cancel")
		assert.equal(result.escaped, true)
	})

	it("should handle requestSelect", async () => {
		const config = {
			title: "Language",
			prompt: "Choose:",
			options: ["en", "uk"],
			id: "lang-select",
		}
		const result = await adapter.requestSelect(config)
		assert.equal(result, "en")
	})

	it("should handle requestSelect cancellation", async () => {
		adapter.select = () => Promise.reject(new CancelError())
		const config = { title: "Test", options: ["opt"], id: "test", prompt: "Choose:" }
		const result = await adapter.requestSelect(config)
		assert.equal(result, "")
	})

	it("should handle requestInput", async () => {
		const config = { prompt: "Enter something: ", id: "name-input" }
		const result = await adapter.requestInput(config)
		assert.equal(result, "")
	})
})