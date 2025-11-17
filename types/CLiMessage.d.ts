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
    requireInput(ui?: any): Promise<object>;
}
import { Message } from "@nan0web/co";
