/** @typedef {import("./ui/select.js").InputFn} InputFn */
/** @typedef {import("./ui/select.js").ConsoleLike} ConsoleLike */
/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLIInputAdapter extends BaseInputAdapter {
    /**
     * @param {Object} [options={}]
     * @param {string|string[]} [options.predefined=process.env.PLAY_DEMO_SEQUENCE ?? []]
     *   Optional array of answers or a string that will be split by
     *   {@link options.divider}.
     * @param {string} [options.divider=process.env.PLAY_DEMO_DIVIDER ?? ","]
     *   Divider for the predefined sequence.
     * @param {ConsoleLike} [options.console]
     * @param {NodeJS.WriteStream} [options.stdout]
     * @param {Map<string, () => Promise<Function>>} [options.components] Dynamic component loaders.
     */
    constructor(options?: {
        predefined?: string | string[] | undefined;
        divider?: string | undefined;
        console?: import("./ui/select.js").ConsoleLike | undefined;
        stdout?: NodeJS.WriteStream | undefined;
        components?: Map<string, () => Promise<Function>> | undefined;
    });
    /** @returns {ConsoleLike} */
    get console(): ConsoleLike;
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
     * @param {UIForm} form - Form definition to present.
     * @param {Object} [options={}]
     * @param {boolean} [options.silent=true] - Suppress console output if `true`.
     * @returns {Promise<Object>} Result object containing form data and meta‑information.
     */
    requestForm(form: UIForm, options?: {
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
     * @param {UIForm} form - Form definition.
     * @param {object} [_state] - Unused, kept for compatibility with `CLiMessage`.
     * @returns {Promise<Object>} Same shape as {@link requestForm} result.
     */
    processForm(form: UIForm, _state?: object): Promise<any>;
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
    /** @inheritDoc */
    ask(question: any): Promise<string>;
    /** @inheritDoc */
    select(cfg: any): Promise<{
        index: number;
        value: any;
    }>;
    #private;
}
export type InputFn = import("./ui/select.js").InputFn;
export type ConsoleLike = import("./ui/select.js").ConsoleLike;
import { InputAdapter as BaseInputAdapter } from "@nan0web/ui";
import { UIForm } from "@nan0web/ui";
