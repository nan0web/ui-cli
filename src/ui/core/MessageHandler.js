import { CancelError } from '@nan0web/ui/core'
import { generateForm } from '../impl/form.js'

/**
 * Handles `requireInput()` workflow for UiMessage instances.
 *
 * Validates a message against its static Body schema,
 * presents an auto-generated form and loops until valid.
 *
 * Extracted from CLiInputAdapter.requireInput().
 */
export default class MessageHandler {
	/**
	 * @param {import('./InputAdapter.js').default} adapter
	 * @param {import('@nan0web/ui').UiMessage} msg - Message instance needing input.
	 * @returns {Promise<any>} Updated message body.
	 * @throws {CancelError} When user cancels the form.
	 */
	static async requireInput(adapter, msg) {
		if (!msg || typeof msg !== 'object') {
			throw new Error('Message instance is required')
		}
		// Use duck typing instead of instanceof to avoid monorepo duplicate module issues
		if (
			typeof msg.validate !== 'function' ||
			!msg.constructor ||
			!(/** @type {any} */ (msg.constructor).Body)
		) {
			throw new TypeError(
				'Message must be an instance of UiMessage (implementing static Body and validate())'
			)
		}
		/** @type {Map<string,string>} */
		let errors = msg.validate()
		while (errors.size > 0) {
			const form = generateForm(/** @type {any} */ (msg.constructor).Body, {
				initialState: msg.body,
				t: adapter.t,
			})

			const formResult = await adapter.processForm(form, msg.body)
			if (formResult.cancelled) {
				throw new CancelError('User cancelled form')
			}

			const updatedBody = { ...msg.body, ...formResult.form.state }
			const updatedErrors = msg.validate(updatedBody)

			if (updatedErrors.size > 0) {
				errors = updatedErrors
				continue
			}
			msg.body = updatedBody
			break
		}
		return /** @type {any} */ (msg.body)
	}
}
