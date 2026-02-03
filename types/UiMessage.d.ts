/** @typedef {import("@nan0web/co").MessageBodySchema} MessageBodySchema */
/** @typedef {import("./InputAdapter.js").default} InputAdapter */
/** @typedef {import("./OutputAdapter.js").default} OutputAdapter */
/**
 * Represents a message with UI input requirements.
 * @template {Record<string, any>} T
 * @class
 * @extends {Message}
 */
export default class UiMessage<T extends Record<string, any>> extends Message {
	constructor(
		input?: import('../node_modules/@nan0web/co/types/Message.js').MessageInput | undefined,
	)
	/**
	 * Validates the message body against its schema.
	 *
	 * NOTE: The signature must exactly match `Message.validate` – it returns a
	 * `Map<string,string>` regardless of the generic type, otherwise TypeScript
	 * reports incompatibility with the base class.
	 *
	 * @param {any} [body=this.body] - Optional body to validate.
	 * @returns {Map<string,string>} Map of validation errors (empty if valid).
	 */
	validate(body?: any): Map<string, string>
	/**
	 * Requires input via UI adapter. Validates fields according to the static `Body` schema.
	 *
	 * @param {Object} ui - UI adapter with input/output capabilities.
	 * @param {InputAdapter} ui.input - Input adapter for prompts.
	 * @param {OutputAdapter} [ui.output] - Optional output adapter for rendering.
	 * @returns {Promise<T>} Resolves with updated body or rejects if cancelled.
	 * @throws {CancelError} When user cancels the input process.
	 */
	requireInput(ui: {
		input: InputAdapter
		output?: import('./OutputAdapter.js').default | undefined
	}): Promise<T>
}
export type MessageBodySchema = import('@nan0web/co').MessageBodySchema
export type InputAdapter = import('./InputAdapter.js').default
export type OutputAdapter = import('./OutputAdapter.js').default
import { Message } from '@nan0web/co'
