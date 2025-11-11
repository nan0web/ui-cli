/**
 * Prompt a question and return the trimmed answer.
 *
 * @param {string} question - Text displayed as a prompt.
 * @returns {Promise<string>} User answer without surrounding whitespace.
 */
export function ask(question: string): Promise<string>;
/**
 * Factory that creates a reusable async input handler.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @returns {InputFn} Async function that resolves to an {@link Input}.
 */
export function createInput(stops?: string[] | undefined): InputFn;
/**
 * @typedef {Function} InputFn
 * @param {string} question - Prompt displayed to the user.
 * @param {Function|boolean} [loop=false] - Loop control or validator.
 * @param {Function|false} [nextQuestion=false] - Function to compute the next prompt.
 * @returns {Promise<Input>} Resolves with an {@link Input} instance containing the answer.
 */
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
export default createInput;
export type InputFn = Function;
