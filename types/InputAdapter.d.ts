/**
 * @typedef {Object} ConsoleLike
 * @property {(...args: any[]) => void} debug
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 */
/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLiInputAdapter extends BaseInputAdapter {
    constructor(options?: {});
    /** @returns {ConsoleLike} */
    get console(): ConsoleLike;
    /** @param {Function} val */
    set t(val: Function);
    /** @returns {Function} */
    get t(): Function;
    /** @returns {NodeJS.WriteStream} */
    get stdout(): NodeJS.WriteStream;
    /**
     * Create a handler with stop words that supports predefined answers.
     *
     * @param {string[]} stops - Stop words for cancellation.
     * @returns {Function}
     */
    createHandler(stops?: string[]): Function;
    /**
     * Create a select handler that supports predefined answers.
     * @returns {Function}
     */
    createSelectHandler(): Function;
    /**
     * Pause execution and wait for user input (Press any key).
     *
     * @param {string} [message] - Message to display.
     * @returns {Promise<void>}
     */
    pause(message?: string): Promise<void>;
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
    }): Promise<any>;
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
     * @returns {Promise<string|undefined>} Selected value (or undefined on cancel).
     */
    requestSelect(config: any): Promise<string | undefined>;
    /**
     * Prompt for a single string input.
     *
     * @param {Object} config - Prompt configuration.
     * @returns {Promise<string|undefined>} User response string or undefined on cancel.
     */
    requestInput(config: any): Promise<string | undefined>;
    /**
     * Prompt the user for an autocomplete selection.
     *
     * @param {Object} config - Configuration object.
     * @returns {Promise<any>} Selected value.
     */
    requestAutocomplete(config: any): Promise<any>;
    /**
     * Requests confirmation (yes/no).
     *
     * @param {Object} config - Confirmation configuration.
     * @returns {Promise<boolean>} User confirmation.
     */
    requestConfirm(config: any): Promise<boolean>;
    /**
     * Display an interactive table.
     *
     * @param {Object} config - Table configuration.
     * @returns {Promise<any>}
     */
    requestTable(config: any): Promise<any>;
    /**
     * Requests multiple selection.
     *
     * @param {Object} config - Multiselect configuration.
     * @returns {Promise<any[]>} Selected values.
     */
    requestMultiselect(config: any): Promise<any[]>;
    /**
     * Requests masked input.
     *
     * @param {Object} config - Mask configuration.
     * @returns {Promise<string>} Masked value.
     */
    requestMask(config: any): Promise<string>;
    /**
     * Request a toggle switch.
     * @param {Object} config
     * @returns {Promise<boolean>}
     */
    requestToggle(config: any): Promise<boolean>;
    /**
     * Request a numeric slider.
     * @param {Object} config
     * @returns {Promise<number>}
     */
    requestSlider(config: any): Promise<number>;
    /**
     * Create a progress bar.
     * @param {Object} options
     * @returns {import('./ui/progress.js').ProgressBar}
     */
    requestProgress(options: any): import("./ui/progress.js").ProgressBar;
    /**
     * Create and start a spinner.
     * @param {string} message
     * @returns {import('./ui/spinner.js').Spinner}
     */
    requestSpinner(message: string): import("./ui/spinner.js").Spinner;
    /**
     * Request a selection from a tree view.
     * @param {Object} config
     * @returns {Promise<any>} Selected node(s).
     */
    requestTree(config: any): Promise<any>;
    /**
     * Request a date or time from the user.
     * @param {Object} config
     * @returns {Promise<Date|undefined>}
     */
    requestDateTime(config: any): Promise<Date | undefined>;
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
        cancelled: boolean;
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
export type ConsoleLike = {
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
};
import { InputAdapter as BaseInputAdapter } from '@nan0web/ui';
import { UiForm } from '@nan0web/ui';
import { UiMessage } from '@nan0web/ui';
