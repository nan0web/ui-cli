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
     * @param {import('../InputAdapter.js').default} adapter
     * @param {import('@nan0web/ui').UiMessage} msg - Message instance needing input.
     * @returns {Promise<any>} Updated message body.
     * @throws {CancelError} When user cancels the form.
     */
    static requireInput(adapter: import("../InputAdapter.js").default, msg: import("@nan0web/ui").UiMessage): Promise<any>;
}
