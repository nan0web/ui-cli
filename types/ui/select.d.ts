/** @typedef {import("./input.js").Input} Input */
/** @typedef {import("./input.js").InputFn} InputFn */
/**
 * @typedef {Object} ConsoleLike
 * @property {(...args: any[]) => void} debug
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 */
/**
 * @typedef {Object} SelectConfig
 * @property {string} title – Title displayed above the options list.
 * @property {string} prompt – Prompt displayed for the answer.
 * @property {Array|Map} options – Collection of selectable items.
 * @property {ConsoleLike} console – Console‑like object with an `info` method.
 * @property {string[]} [stops=[]] Words that trigger cancellation.
 * @property {InputFn} [ask] Custom ask function (defaults to {@link createInput}).
 * @property {string} [invalidPrompt="Invalid choice, try again: "] Message shown on invalid input.
 */
/**
 * Configuration object for {@link select}.
 *
 * @param {SelectConfig} input
 * @returns {Promise<{index:number,value:any}>} Resolves with the selected index and its value.
 *
 * @throws {CancelError} When the user cancels the operation.
 * @throws {Error} When options are missing or an incorrect value is supplied and no
 *   `invalidPrompt` is defined.
 */
export function select(input: SelectConfig): Promise<{
    index: number;
    value: any;
}>;
export default select;
export type Input = import("./input.js").Input;
export type InputFn = typeof import("./input.js").InputFn;
export type ConsoleLike = {
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
};
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
    console: ConsoleLike;
    /**
     * Words that trigger cancellation.
     */
    stops?: string[] | undefined;
    /**
     * Custom ask function (defaults to {@link createInput }).
     */
    ask?: typeof import("./input.js").InputFn | undefined;
    /**
     * Message shown on invalid input.
     */
    invalidPrompt?: string | undefined;
};
