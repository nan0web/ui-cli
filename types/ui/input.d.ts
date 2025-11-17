/// <reference types="node" resolution-mode="require"/>
/** @typedef {import("./select.js").ConsoleLike} ConsoleLike */
/** @typedef {(input: Input) => Promise<boolean>} LoopFn */
/** @typedef {(input: Input) => string} NextQuestionFn */
/**
 * Input function.
 * ---
 * Must be used only as a type — typedef does not work with full arguments description for functions.
 * ---
 * @param {string} question - Prompt displayed to the user.
 * @param {boolean | LoopFn} [loop=false] - Loop‑control flag, validator or boolean that forces a single answer.
 * @param {string | NextQuestionFn} [nextQuestion] - When `false` the prompt ends after one answer.
 *                                            When a `function` is supplied it receives the current {@link Input}
 *                                            and must return a new question string for the next iteration.
 *
 * @returns {Promise<Input>} Resolves with an {@link Input} instance that contains the final answer,
 *                           the raw value and cancellation state.
 *
 * @throws {Error} May propagate errors from the underlying readline interface.
 */
export function InputFn(question: string, loop?: boolean | LoopFn | undefined, nextQuestion?: string | NextQuestionFn | undefined): Promise<Input>;
/**
 * Low‑level prompt that returns a trimmed string.
 *
 * @param {Object} input
 * @param {string} input.question - Text displayed as a prompt.
 * @param {string} [input.predef] - Optional predefined answer (useful for testing).
 * @param {ConsoleLike} [input.console] - Optional console to show predefined value
 * @param {import("node:readline").Interface} [input.rl] - Readline interface instnace
 * @returns {Promise<string>} The answer without surrounding whitespace.
 *
 * When `predef` is supplied the function mimics the usual readline output
 * (`question + answer + newline`) and returns the trimmed value.
 */
export function _askRaw(input: {
    question: string;
    predef?: string | undefined;
    console?: import("./select.js").ConsoleLike | undefined;
    rl?: import("readline").Interface | undefined;
}): Promise<string>;
/**
 * Factory that creates a reusable async input handler.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {ConsoleLike} [console] Optional console instance.
 * @returns {InputFn} Async function that resolves to an {@link Input}.
 */
export function createInput(stops?: string[] | undefined, predef?: string | undefined, console?: import("./select.js").ConsoleLike | undefined): typeof InputFn;
/**
 * @param {string[]} predefined
 * @param {ConsoleLike} console
 * @param {string[]} [stops=[]]
 * @returns {import("./select.js").InputFn}
 * @throws {CancelError}
 */
export function createPredefinedInput(predefined: string[], console: ConsoleLike, stops?: string[] | undefined): import("./select.js").InputFn;
/**
 * Represents a line of user input.
 *
 * @class
 * @property {string} value – The raw answer string.
 * @property {string[]} stops – Words that trigger cancellation.
 * @property {boolean} cancelled – True when the answer matches a stop word.
 */
export class Input {
    /**
     * Create a new {@link Input} instance.
     *
     * @param {Object} [input={}] - Optional initial values.
     * @param {string} [input.value] - Initial answer string.
     * @param {boolean} [input.cancelled] - Initial cancel flag.
     * @param {string|string[]} [input.stops] - Words that trigger cancellation.
     */
    constructor(input?: {
        value?: string | undefined;
        cancelled?: boolean | undefined;
        stops?: string | string[] | undefined;
    } | undefined);
    /** @type {string} */
    value: string;
    /** @type {string[]} */
    stops: string[];
    /**
     * Returns whether the input has been cancelled either explicitly or via a stop word.
     *
     * @returns {boolean}
     */
    get cancelled(): boolean;
    /** @returns {string} The raw answer value. */
    toString(): string;
    #private;
}
/**
 * High‑level input helper `ask`.
 *
 * This constant inherits the full {@link InputFn} signature **and** the
 * detailed JSDoc description for each argument, as defined in {@link InputFn}.
 *
 * @type {InputFn}
 */
export const ask: typeof InputFn;
export default createInput;
export type ConsoleLike = import("./select.js").ConsoleLike;
export type LoopFn = (input: Input) => Promise<boolean>;
export type NextQuestionFn = (input: Input) => string;
