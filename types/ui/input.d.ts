/**
 * Triggers a system beep (ASCII Bell).
 */
export function beep(): void;
/**
 * Modern text input with validation and default value.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} [config.initial] - Default value
 * @param {string} [config.type] - Prompt type (text, password, etc)
 * @param {(value:string)=>boolean|string|Promise<boolean|string>} [config.validate] - Validator
 * @returns {Promise<{value:string, cancelled:boolean}>}
 */
export function text(config: {
    message: string;
    initial?: string | undefined;
    type?: string | undefined;
    validate?: ((value: string) => boolean | string | Promise<boolean | string>) | undefined;
}): Promise<{
    value: string;
    cancelled: boolean;
}>;
/**
 * Factory that creates a reusable async input handler.
 * Adapter for legacy ask() signature.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {Object} [console] Optional console instance.
 * @param {(input: Input) => Promise<boolean>|boolean} [loop] Optional loop validator.
 * @returns {Function} Async function that resolves to an {@link Input}.
 */
export function createInput(stops?: string[] | undefined, predef?: string | undefined, console?: any, loop?: ((input: Input) => Promise<boolean> | boolean) | undefined): Function;
/**
 * Mock helper for predefined inputs (Testing).
 */
export function createPredefinedInput(predefined: any, console: any, stops?: any[]): (question: any) => Promise<Input>;
/**
 * Represents a line of user input.
 *
 * @class
 * @property {string} value – The raw answer string.
 * @property {string[]} stops – Words that trigger cancellation.
 * @property {boolean} cancelled – True when the answer matches a stop word.
 */
export class Input {
    constructor(input?: {});
    /** @type {string} */
    value: string;
    /** @type {string[]} */
    stops: string[];
    get cancelled(): boolean;
    toString(): string;
    #private;
}
/**
 * High‑level input helper `ask`.
 * Use this for simple string prompts.
 */
export const ask: Function;
export default createInput;
