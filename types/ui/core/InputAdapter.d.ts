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
    /** @type {Map<string, any>} */
    activeProgresses: Map<string, any>;
    answerQueue: AnswerQueue;
    dispatcher: IntentDispatcher;
    cancelled: boolean;
    /** @returns {ConsoleLike} */
    get console(): ConsoleLike;
    /** @param {Function} val */
    set t(val: Function);
    /** @returns {Function} */
    get t(): Function;
    /** @returns {NodeJS.WriteStream} */
    get stdout(): NodeJS.WriteStream;
    set json(val: any);
    get json(): any;
    _json: any;
    /**
     * Proxy to set disabled state for testing previews
     */
    set _disableNextAnswerLookup(val: boolean);
    get _disableNextAnswerLookup(): boolean;
    /** @returns {string[]} */
    getRemainingAnswers(): string[];
    set _answers(val: any[]);
    get _answers(): any[];
    set _cursor(val: number);
    get _cursor(): number;
    set '#answers'(val: any[]);
    get '#answers'(): any[];
    set '#cursor'(val: number);
    get '#cursor'(): number;
    /**
     * Execute an interactive prompt component, handling automated answers.
     *
     * @param {Object} component - Prompt component to execute.
     * @returns {Promise<AskResponse>}
     */
    executePrompt(component: any): Promise<AskResponse>;
    /**
     * Create a handler with stop words that supports predefined answers.
     *
     * @param {string[]} stops - Stop words for cancellation.
     * @returns {Function}
     */
    createHandler(stops?: string[]): Function;
    createSelectHandler(): (config: any) => Promise<import("@nan0web/ui/src/core/Intent.js").AskResponse>;
    /**
     * Pause execution and wait for user input (Press any key).
     *
     * @param {string} [message] - Message to display.
     * @returns {Promise<void|{value: undefined, cancelled: boolean}>}
     */
    pause(message?: string): Promise<void | {
        value: undefined;
        cancelled: boolean;
    }>;
    /**
     * Prompt the user for a full form, handling navigation and validation.
     *
     * @param {UiForm} form - Form definition to present.
     * @param {RequestFormOptions} [options={}]
     * @returns {Promise<AskResponse>} Result object containing form data and meta‑information.
     */
    requestForm(form: UiForm, options?: RequestFormOptions): Promise<AskResponse>;
    /**
     * Render a UI component in the CLI environment.
     *
     * The current CLI adapter only supports simple textual rendering.
     *
     * @param {string|Object} component - Component name (e.g. `"Alert"`) or render descriptor.
     * @param {object} [props] - Props object passed to the component.
     * @returns {Promise<void>}
     */
    render(component: string | any, props?: object): Promise<void>;
    /** @param {Object} intent */
    log(intent: any): Promise<void>;
    /** @param {Object} intent */
    progress(intent: any): Promise<{
        onData: (chunk: any) => void;
        onEnd: () => void;
    } | undefined>;
    /** @param {Object} intent */
    result(intent: any): Promise<void>;
    /**
     * Process a full form – thin wrapper around {@link requestForm}.
     *
     * @param {UiForm} form - Form definition.
     * @param {object} [_state] - Unused, kept for compatibility with `CLiMessage`.
     * @returns {Promise<AskResponse>} Same shape as {@link requestForm} result.
     */
    processForm(form: UiForm, _state?: object): Promise<AskResponse>;
    /**
     * Prompt the user to select an option from a list.
     *
     * @param {Object} config - Configuration object.
     * @returns {Promise<AskResponse>} Selected value (or null on cancel).
     */
    requestSelect(config: any): Promise<AskResponse>;
    /**
     * Prompt for a single string input.
     *
     * @param {Object} config - Prompt configuration.
     * @returns {Promise<AskResponse>} User response string or null on cancel.
     */
    requestInput(config: any): Promise<AskResponse>;
    requestPassword(config: any): Promise<import("@nan0web/ui/src/core/Intent.js").AskResponse>;
    /**
     * Prompt the user for an autocomplete selection.
     *
     * @param {Object} config - Configuration object.
     * @returns {Promise<AskResponse>} Selected value.
     */
    requestAutocomplete(config: any): Promise<AskResponse>;
    /**
     * Requests confirmation (yes/no).
     *
     * @param {Object} config - Confirmation configuration.
     * @returns {Promise<AskResponse>} User confirmation.
     */
    requestConfirm(config: any): Promise<AskResponse>;
    /**
     * Requests multiple selection.
     *
     * @param {Object} config - Multiselect configuration.
     * @returns {Promise<AskResponse>} Selected values.
     */
    requestMultiselect(config: any): Promise<AskResponse>;
    /**
     * Requests masked input.
     *
     * @param {Object} config - Mask configuration.
     * @returns {Promise<AskResponse>} Masked value.
     */
    requestMask(config: any): Promise<AskResponse>;
    /**
     * Request a toggle switch.
     * @param {Object} config
     * @returns {Promise<AskResponse>}
     */
    requestToggle(config: any): Promise<AskResponse>;
    /**
     * Request a numeric slider.
     * @param {Object} config
     * @returns {Promise<AskResponse>}
     */
    requestSlider(config: any): Promise<AskResponse>;
    /**
     * Create a progress bar.
     * @param {Object} options
     * @returns {import('../impl/progress.js').ProgressBar}
     */
    requestProgress(options: any): import("../impl/progress.js").ProgressBar;
    requestSpinner(config: any): any;
    /**
     * Request a selection from a tree view.
     * @param {Object} config
     * @returns {Promise<AskResponse>} Selected node(s).
     */
    requestTree(config: any): Promise<AskResponse>;
    /**
     * Request a sortable (reorderable) list.
     *
     * In predefined mode the answer is treated as a comma‑separated list of
     * values representing the desired final order.  Only items whose values
     * appear in the answer are included; this lets you reorder a subset.
     *
     * @param {Object} config
     * @param {string} config.message - Prompt / title.
     * @param {Array<string|{label:string,value:any}>} config.items - Items to sort.
     * @param {string} [config.hint] - Hint text.
     * @param {Function} [config.onChange] - Callback on every reorder.
     * @returns {Promise<AskResponse>}
     */
    requestSortable(config: {
        message: string;
        items: Array<string | {
            label: string;
            value: any;
        }>;
        hint?: string | undefined;
        onChange?: Function | undefined;
    }): Promise<AskResponse>;
    /**
     * Request a date or time from the user.
     * @param {Object} config
     * @returns {Promise<AskResponse>}
     */
    requestDateTime(config: any): Promise<AskResponse>;
    /**
     * Handle OLMUI Ask intents.
     *
     * @param {import('@nan0web/ui/core').Intent} intent
     * @returns {Promise<AskResponse>}
     */
    askIntent(intent: import("@nan0web/ui/core").Intent): Promise<AskResponse>;
    /**
     * Handle OLMUI Log / Show intents.
     *
     * @param {import('@nan0web/ui/core').Intent} intent
     * @returns {Promise<void>}
     */
    logIntent(intent: import("@nan0web/ui/core").Intent): Promise<void>;
    /**
     * Handle OLMUI Result intents.
     *
     * @param {import('@nan0web/ui/core').Intent} intent
     * @returns {Promise<void>}
     */
    resultIntent(intent: import("@nan0web/ui/core").Intent): Promise<void>;
    /**
     * Handle OLMUI Progress intents via Spinner/ProgressBar.
     *
     * @param {import('@nan0web/ui/core').Intent} intent
     * @returns {Promise<any>}
     */
    progressIntent(intent: import("@nan0web/ui/core").Intent): Promise<any>;
    /**
     * **New API** – Require input for a {@link UiMessage} instance.
     *
     * Validates the message according to its static Body schema, presents a
     * generated form and returns the updated body.
     *
     * @param {any} msg - Message instance needing input.
     * @returns {Promise<any>} Updated message body.
     * @throws {CancelError} When user cancels the input process.
     */
    requireInput(msg: any): Promise<any>;
    /**
     * Render a form for the given data and schema class.
     *
     * @param {Object} data - Initial document data.
     * @param {Function} SchemaClass - Schema constructor with static fields.
     * @returns {{fill: () => Promise<any>}} Form object with fill method.
     */
    /**
     * Generic request handler that dispatches to specific request methods based on type.
     * @param {Object} config
     * @returns {Promise<AskResponse>}
     */
    request(config: any): Promise<AskResponse>;
    /**
     * Request a content viewer (scrollable markdown with interactive elements).
     * @param {Object} config
     * @returns {Promise<AskResponse>}
     */
    requestContentViewer(config: any): Promise<AskResponse>;
    #private;
}
export type RequestFormOptions = {
    /**
     * - Suppress console output if `true`.
     */
    silent?: boolean | undefined;
};
export type AskResponse = import("@nan0web/ui/core").AskResponse;
export type Intent = import("@nan0web/ui/core").Intent;
export type AskOptions = import("@nan0web/ui/core").AskOptions;
export type ConsoleLike = {
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
};
import { InputAdapter as BaseInputAdapter } from '@nan0web/ui/core';
import AnswerQueue from './AnswerQueue.js';
import IntentDispatcher from './IntentDispatcher.js';
import { UiForm } from '@nan0web/ui';
