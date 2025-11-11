/**
 * Configuration object for {@link select}.
 *
 * @typedef {Object} SelectConfig
 * @property {string} title – Title displayed above the options list.
 * @property {string} prompt – Prompt displayed for the answer.
 * @property {Array|Map} options – Collection of selectable items.
 * @property {Object} console – Console‑like object with an `info` method.
 * @property {string[]} [stops=[]] Words that trigger cancellation.
 * @property {import("./input.js").InputFn} [ask] Custom ask function (defaults to {@link createInput}).
 * @property {string} [invalidPrompt="Invalid choice, try again: "] Message shown on invalid input.
 *
 * @returns {Promise<{index:number,value:any}>} Resolves with the selected index and its value.
 */
export function select({ title, prompt, invalidPrompt, options, console, stops, ask: initAsk, }: {
    title: any;
    prompt: any;
    invalidPrompt?: string | undefined;
    options: any;
    console: any;
    stops?: any[] | undefined;
    ask: any;
}): Promise<{
    index: number;
    value: any;
}>;
export default select;
/**
 * Configuration object for {@link select }.
 */
export type SelectConfig = {
    /**
     * – Title displayed above the options list.
     */
    title: string;
    /**
     * – Prompt displayed for the answer.
     */
    prompt: string;
    /**
     * – Collection of selectable items.
     */
    options: any[] | Map<any, any>;
    /**
     * – Console‑like object with an `info` method.
     */
    console: any;
    /**
     * Words that trigger cancellation.
     */
    stops?: string[] | undefined;
    /**
     * Custom ask function (defaults to {@link createInput }).
     */
    ask?: Function | undefined;
    /**
     * Message shown on invalid input.
     */
    invalidPrompt?: string | undefined;
};
