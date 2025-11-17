import { Message } from "@nan0web/co"
import { FormInput, UIForm } from "@nan0web/ui"
import CommandError from "./CommandError.js"
import CommandParser from "./CommandParser.js"
import { CancelError } from "@nan0web/ui"

/**
 * Generates a UIForm from a Message body schema.
 *
 * @param {typeof Object} BodyClass – Class containing static field schemas.
 * @param {object} [initialState={}] - Optional initial field values.
 * @returns {UIForm}
 */
function generateFormFromBodyMeta(BodyClass, initialState = {}) {
	const fields = []
	/** @type {Array<[string, import("@nan0web/co").MessageBodySchema]>} */
	const entries = Object.entries(BodyClass)
	for (const [field, schema] of entries) {
		if (typeof schema !== "object") continue
		fields.push(
			new FormInput({
				name: field,
				label: schema.help || field,
				type: schema.type || "text",
				required: schema.required || false,
				validation: schema.validate || (() => true),
				placeholder: schema.placeholder || "",
				options: schema.options || [],
			}),
		)
	}
	return new UIForm({ title: BodyClass.name, fields, state: initialState })
}

/**
 * @class CLiMessage
 * @extends Message
 */
export default class CLiMessage extends Message {
	/**
	 * Require input via UI (CLI or other adapters). Validates fields according to
	 * the static `Body` schema of the concrete message class.
	 *
	 * @param {any} [ui] - UI adapter with a `processForm` method.
	 * @returns {Promise<object>} Updated message body.
	 * @throws {CancelError} When the user cancels the form.
	 */
	async requireInput(ui) {
		let errors = this.validate()
		while (errors.size > 0) {
			if (ui) {
				const form = generateFormFromBodyMeta(
					/** @type {any} */ (this.constructor).Body,
					this.body,
				)
				const formResult = await ui.processForm(form, this.body)

				if (formResult.escaped) {
					throw new CancelError("User cancelled form")
				}

				const updatedBody = { ...this.body, ...formResult.form.state }
				const updatedErrors = /** @type {any} */ (this.constructor).Body.validate(updatedBody)

				if (updatedErrors.size > 0) {
					await ui.render("Alert", {
						variant: "error",
						content: Array.from(updatedErrors.values()).join("\n"),
					})
					errors = updatedErrors
					continue
				}

				this.body = updatedBody
				break
			} else {
				const errMsg = Array.from(errors.values()).join(", ")
				throw new CommandError(`Invalid input: ${errMsg}`, {
					errors: Object.fromEntries(errors),
				})
			}
		}
		return this.body
	}
}
