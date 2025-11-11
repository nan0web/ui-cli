/**
 * CLIInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import { Message } from "@nan0web/co"
import {
	UIForm,
	InputAdapter as BaseInputAdapter,
} from "@nan0web/ui"
import { ask } from "./ui/input.js"
import { select } from "./ui/select.js"
import { CancelError } from "@nan0web/ui/core"

/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLIInputAdapter extends BaseInputAdapter {
	/**
	 * Prompt the user for a full form, handling navigation and validation.
	 *
	 * @param {UIForm} form - Form definition to present.
	 * @param {Object} [options={}]
	 * @param {boolean} [options.silent=true] - Suppress console output if `true`.
	 * @returns {Promise<Object>} Result object containing form data and meta‑information.
	 */
	async requestForm(form, options = {}) {
		const { silent = true } = options
		if (!silent) console.log(`\n${form.title}\n`)

		let formData = { ...form.state }
		let idx = 0

		while (idx < form.fields.length) {
			const field = form.fields[idx]
			const prompt = `${field.label || field.name}${field.required ? " *" : ""}: `
			const answer = await this.ask(prompt)

			if (["", "esc"].includes(answer)) {
				return {
					body: { action: "form-cancel", escaped: true, form: {}, id: form.id },
					form: {},
					escaped: true,
					action: "form-cancel",
					id: form.id,
				}
			}

			const trimmed = answer.trim()
			if (trimmed === "::prev" || trimmed === "::back") {
				idx = Math.max(0, idx - 1)
				continue
			}
			if (trimmed === "::next" || trimmed === "::skip") {
				idx++
				continue
			}
			if (trimmed === "" && !field.required) {
				idx++
				continue
			}
			if (field.required && trimmed === "") {
				console.log("\nField is required.")
				continue
			}
			const schema = field.constructor
			const { isValid, errors } = form.validateValue(field.name, trimmed, schema)
			if (!isValid) {
				console.log("\n" + Object.values(errors).join("\n"))
				continue
			}
			formData[field.name] = trimmed
			idx++
		}

		const finalForm = form.setData(formData)
		const { isValid, errors } = finalForm.validate()
		if (!isValid) {
			console.log("\n" + Object.values(errors).join("\n"))
			return await this.requestForm(form, options)
		}

		return {
			body: { action: "form-submit", escaped: false, form: finalForm, id: form.id },
			form: finalForm,
			escaped: false,
			action: "form-submit",
			id: form.id,
		}
	}

	/**
	 * Prompt the user to select an option from a list.
	 *
	 * @param {Object} config - Configuration passed to {@link select}.
	 * @returns {Promise<any>} Selected value, or empty string on cancellation.
	 */
	async requestSelect(config) {
		try {
			const result = await this.select({
				title: config.title ?? "Select an option:",
				prompt: config.prompt ?? "Choose (1‑N): ",
				options: config.options,
				console: console,
			})
			return result.value
		} catch (e) {
			if (e instanceof CancelError) return ""
			throw e
		}
	}

	/**
	 * Prompt for a single string input.
	 *
	 * @param {Object} config - Prompt configuration.
	 * @param {string} [config.prompt] - Prompt text.
	 * @param {string} [config.label] - Optional label.
	 * @param {string} [config.name] - Optional identifier.
	 * @returns {Promise<string>} User response string.
	 */
	async requestInput(config) {
		const prompt = config.prompt ?? `${config.label ?? config.name}: `
		const input = await this.ask(prompt)
		return input
	}

	/** @inheritDoc */
	async ask(question) {
		return ask(question)
	}
	/** @inheritDoc */
	async select(cfg) {
		return select(cfg)
	}
}