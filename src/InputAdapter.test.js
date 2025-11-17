import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { UIForm, FormInput } from "@nan0web/ui"
import { CancelError } from "@nan0web/ui/core"
import { Input } from "./ui/input.js"
import CLIInputAdapter from "./InputAdapter.js"
import { NoConsole } from "@nan0web/log"

describe("CLIInputAdapter", () => {
	let adapter, mockAsk, mockSelect

	beforeEach(() => {
		adapter = new CLIInputAdapter()
		mockAsk = (q) => {
			if (q.includes("Email")) return new Input({ value: "test@example.com" })
			if (q.includes("*")) return new Input({ value: "John Doe" })
			return new Input({ value: "" })
		}
		adapter.ask = mockAsk
		mockSelect = async (config) => ({ index: 0, value: "en" })
		adapter.select = mockSelect
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
			validateValue: () => ({ isValid: true, errors: {} }),
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ isValid: true, errors: {} }),
			state: {},
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
			validateValue: () => ({ isValid: true, errors: {} }),
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ isValid: true, errors: {} }),
			state: {},
		})
		adapter.ask = async () => new Input({ value: "" })
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

	it("should render simple component fallback", async () => {
		const adapter = new CLIInputAdapter({ console: new NoConsole() })
		await adapter.render("Simple", { variant: "info", content: "Hello" })
		// Fallback logs "[info] Hello"
		assert.equal(adapter.console.output()[0][1], "[info] Hello")
	})

	it("should load and render component from map", async () => {
		const components = new Map([
			["Alert", async () => (await import("./components/Alert.js")).default]
		])
		const adapter = new CLIInputAdapter({ components, console: new NoConsole() })
		await adapter.render("Alert", { variant: "info", content: "Test alert" })
		// Calls console.info("Test alert")
		await adapter.render("Alert", { variant: "error", content: "Incorrect information" })
		assert.equal(adapter.console.output()[0][0], "info")
		assert.equal(adapter.console.output()[0][1], "Test alert")
		assert.equal(adapter.console.output()[1][0], "error")
		assert.equal(adapter.console.output()[1][1], "Incorrect information")
	})
})
