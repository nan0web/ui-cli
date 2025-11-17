/**
 * CLI-specific form handler that introspects a model class for static field schemas.
 * Prompts for input field-by-field (or selection), validates, and updates the model instance.
 *
 * @class
 */
export default class Form {
    /**
     * @param {Object} model - Model instance (e.g., new User({ username: argv[3] })).
     * @param {Object} [options={}] - Options.
     * @param {string[]} [options.stops=["quit", "cancel", "exit"]] - Stop words.
     * @param {(prompt: string) => Promise<Input>} [options.inputFn] - Custom input function.
     * @throws {TypeError} If model is not an object with a constructor.
     */
    constructor(model: any, options?: {
        stops?: string[] | undefined;
        inputFn?: ((prompt: string) => Promise<Input>) | undefined;
    } | undefined);
    /** @type {Function} Input handler with cancellation support. */
    handler: Function;
    /**
     * Prompts for selection using the provided configuration.
     *
     * @param {Object} config - Selection configuration.
     * @returns {Promise<{index:number, value:any}>} Selected option.
     */
    select(config: any): Promise<{
        index: number;
        value: any;
    }>;
    /**
     * Prompts for input using the internal handler.
     *
     * @param {string} prompt - Input prompt.
     * @returns {Promise<Input>} Input result.
     */
    input(prompt: string): Promise<Input>;
    /**
     * Prompts for input, validates, and updates the model.
     * Uses `ask` for text fields and `select` for option-based fields.
     * Supports cancellation via stop words.
     *
     * @returns {Promise<{cancelled:boolean}>} Result indicating if cancelled.
     * @throws {Error} Propagates non-cancellation errors.
     */
    requireInput(): Promise<{
        cancelled: boolean;
    }>;
    /**
     * Converts raw input value based on field schema.
     *
     * @param {Object} field - Field config.
     * @param {string} value - Raw string value.
     * @returns {string|number|boolean} Typed value.
     */
    convertValue(field: any, value: string): string | number | boolean;
    /** @returns {Object} The updated model instance. */
    get body(): any;
    #private;
}
import { Input } from "./input.js";
