/** @typedef {import("./ui/select.js").InputFn} InputFn */
/** @typedef {import("./ui/select.js").ConsoleLike} ConsoleLike */
/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLiInputAdapter extends BaseInputAdapter {
    constructor(options?: {});
    /** @returns {ConsoleLike} */
    get console(): import("./ui/select.js").ConsoleLike;
    /** @returns {NodeJS.WriteStream} */
    get stdout(): NodeJS.WriteStream;
    /**
     * Create a handler with stop words that supports predefined answers.
     *
     * @param {string[]} stops - Stop words for cancellation.
     * @returns {InputFn}
     */
    createHandler(stops?: string[]): InputFn;
    /**
     * Prompt the user for a full form, handling navigation and validation.
     *
     * @param {UiForm} form - Form definition to present.
     * @param {Object} [options={}]
     * @param {boolean} [options.silent=true] - Suppress console output if `true`.
     * @returns {Promise<Object>} Result object containing form data and meta‑information.
     */
    requestForm(form: UiForm, options?: {
        silent?: boolean | undefined;
    } | undefined): Promise<any>;
    /**
     * Render a UI component in the CLI environment.
     *
     * The current CLI adapter only supports simple textual rendering.
     *
     * @param {string} component - Component name (e.g. `"Alert"`).
     * @param {object} props - Props object passed to the component.
     * @returns {Promise<void>}
     */
    render(component: string, props: object): Promise<void>;
    /**
     * Process a full form – thin wrapper around {@link requestForm}.
     *
     * @param {UiForm} form - Form definition.
     * @param {object} [_state] - Unused, kept for compatibility with `CLiMessage`.
     * @returns {Promise<Object>} Same shape as {@link requestForm} result.
     */
    processForm(form: UiForm, _state?: object): Promise<any>;
    /**
     * Prompt the user to select an option from a list.
     *
     * @param {Object} config - Configuration object.
     * @returns {Promise<string>} Selected value (or empty string on cancel).
     */
    requestSelect(config: any): Promise<string>;
    /**
     * Prompt for a single string input.
     *
     * @param {Object} config - Prompt configuration.
     * @returns {Promise<string>} User response string.
     */
    requestInput(config: any): Promise<string>;
    /**
     * Asks user a question or form and returns the completed form
     * @param {string | UiForm} question
     * @param {object} [options={}]
     *
     */
    ask(question: string | UiForm, options?: object): Promise<any>;
    /** @inheritDoc */
    select(cfg: any): Promise<{
        index: number;
        value: any;
    }>;
    /**
     * **New API** – Require input for a {@link UiMessage} instance.
     *
     * This method mirrors the previous `UiMessage.requireInput` logic, but is now
     * owned by the UI adapter. It validates the message according to its static
     * {@link UiMessage.Body} schema, presents a generated {@link UiForm} and
     * returns the updated body.  Cancellation results in a {@link CancelError}.
     *
     * @param {UiMessage} msg - Message instance needing input.
     * @returns {Promise<any>} Updated message body.
     * @throws {CancelError} When user cancels the input process.
     */
    requireInput(msg: UiMessage): Promise<any>;
    #private;
}
export type InputFn = import("./ui/select.js").InputFn;
export type ConsoleLike = import("./ui/select.js").ConsoleLike;
import { InputAdapter as BaseInputAdapter } from "@nan0web/ui";
import { UiForm } from "@nan0web/ui";
import { UiMessage } from "@nan0web/ui";
