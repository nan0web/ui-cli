/**
 * Generates a UiForm instance from a Body class static schema.
 *
 * @param {Function} BodyClass Class containing static field definitions.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.initialState={}] Initial values for the form fields.
 * @param {Function} [options.t] Optional translation function.
 * @returns {UiForm} UiForm populated with fields derived from the schema.
 *
 * The function inspects static properties of `BodyClass` (e.g., `static username = { … }`)
 * and maps each to a {@link FormInput}. The generated {@link UiForm} title defaults
 * to `BodyClass.name` unless overridden via the schema.
 */
export function generateForm(BodyClass: Function, options?: {
    initialState?: any;
    t?: Function | undefined;
}): UiForm;
/**
 * CLI-specific form handler that introspects a model class for static field schemas.
 *
 * @class
 */
export default class Form {
    /**
     * Creates a {@link Form} instance directly from a Body schema.
     *
     * @param {typeof Object} BodyClass Class with static schema definitions.
     * @param {Object} [initialModel={}] Optional initial model data.
     * @param {Object} [options={}] Same options as the constructor.
     * @returns {Form} New Form instance.
     *
     * @example
     *   const form = Form.createFromBodySchema(UserBody, { username: "bob" })
     */
    static createFromBodySchema(BodyClass: typeof Object, initialModel?: any, options?: any): Form;
    /**
     * @param {Object} model - Model instance (e.g., new User({ username: argv[3] })).
     * @param {Object} [options={}] - Options.
     * @param {string[]} [options.stops=["quit", "cancel", "exit"]] - Stop words.
     * @param {(prompt: string) => Promise<Input>} [options.inputFn] - Custom input function.
     * @param {(config: object) => Promise<{index:number, value:any}>} [options.selectFn] - Custom select function.
     * @param {(config: object) => Promise<{value: number, cancelled: boolean}>} [options.sliderFn] - Custom slider function.
     * @param {(config: object) => Promise<{value: boolean, cancelled: boolean}>} [options.toggleFn] - Custom toggle function.
     * @param {Function} [options.t] - Optional translation function.
     * @throws {TypeError} If model is not an object with a constructor.
     */
    constructor(model: any, options?: {
        stops?: string[] | undefined;
        inputFn?: ((prompt: string) => Promise<Input>) | undefined;
        selectFn?: ((config: object) => Promise<{
            index: number;
            value: any;
        }>) | undefined;
        sliderFn?: ((config: object) => Promise<{
            value: number;
            cancelled: boolean;
        }>) | undefined;
        toggleFn?: ((config: object) => Promise<{
            value: boolean;
            cancelled: boolean;
        }>) | undefined;
        t?: Function | undefined;
    });
    /** @type {Function} Input handler with cancellation support. */
    handler: Function;
    options: {
        stops?: string[] | undefined;
        inputFn?: ((prompt: string) => Promise<Input>) | undefined;
        selectFn?: ((config: object) => Promise<{
            index: number;
            value: any;
        }>) | undefined;
        sliderFn?: ((config: object) => Promise<{
            value: number;
            cancelled: boolean;
        }>) | undefined;
        toggleFn?: ((config: object) => Promise<{
            value: boolean;
            cancelled: boolean;
        }>) | undefined;
        t?: Function | undefined;
    };
    t: Function;
    select: typeof select | ((config: object) => Promise<{
        index: number;
        value: any;
    }>);
    get fields(): any[];
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
import { UiForm } from '@nan0web/ui';
import { Input } from './input.js';
import { select } from './select.js';
