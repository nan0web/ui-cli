/**
 * Generates a UiForm instance from a Body class static schema.
 *
 * @param {Function} BodyClass Class containing static field definitions.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.initialState={}] Initial values for the form fields.
 * @param {Function} [options.t] Optional translation function.
 * @returns {UiForm} UiForm populated with fields derived from the schema.
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
     */
    static createFromBodySchema(BodyClass: typeof Object, initialModel?: any, options?: any): Form;
    /**
     * @param {Object} model - Model instance (e.g., new User({ username: argv[3] })).
     * @param {Object} [options={}] - Options.
     * @param {string[]} [options.stops=["quit", "cancel", "exit"]] - Stop words.
     * @param {(config: any) => Promise<any>} [options.inputFn] - Custom input function (supports config object).
     * @param {(config: any) => Promise<{index:number, value:any, cancelled?: boolean}>} [options.selectFn] - Custom select function.
     * @param {(config: any) => Promise<any>} [options.autocompleteFn] - Custom autocomplete function.
     * @param {(config: any) => Promise<any>} [options.maskFn] - Custom mask function.
     * @param {(config: any) => Promise<any>} [options.multiselectFn] - Custom multiselect function.
     * @param {(config: any) => Promise<any>} [options.datetimeFn] - Custom datetime function.
     * @param {(config: any) => Promise<any>} [options.confirmFn] - Custom confirm function.
     * @param {(config: any) => Promise<{value: number|undefined, cancelled: boolean}>} [options.sliderFn] - Custom slider function.
     * @param {(config: any) => Promise<{value: boolean|undefined, cancelled: boolean}>} [options.toggleFn] - Custom toggle function.
     * @param {Object} [options.console] - Optional console for logging.
     * @param {Function} [options.t] - Optional translation function.
     * @param {number} [options.maxRetries] - Max retries before infinite loop detection.
     * @throws {TypeError} If model is not an object with a constructor.
     */
    constructor(model: any, options?: {
        stops?: string[] | undefined;
        inputFn?: ((config: any) => Promise<any>) | undefined;
        selectFn?: ((config: any) => Promise<{
            index: number;
            value: any;
            cancelled?: boolean;
        }>) | undefined;
        autocompleteFn?: ((config: any) => Promise<any>) | undefined;
        maskFn?: ((config: any) => Promise<any>) | undefined;
        multiselectFn?: ((config: any) => Promise<any>) | undefined;
        datetimeFn?: ((config: any) => Promise<any>) | undefined;
        confirmFn?: ((config: any) => Promise<any>) | undefined;
        sliderFn?: ((config: any) => Promise<{
            value: number | undefined;
            cancelled: boolean;
        }>) | undefined;
        toggleFn?: ((config: any) => Promise<{
            value: boolean | undefined;
            cancelled: boolean;
        }>) | undefined;
        console?: any;
        t?: Function | undefined;
        maxRetries?: number | undefined;
    });
    /** @type {Function} Input handler with cancellation support. */
    handler: Function;
    options: {
        stops?: string[] | undefined;
        inputFn?: ((config: any) => Promise<any>) | undefined;
        selectFn?: ((config: any) => Promise<{
            index: number;
            value: any;
            cancelled?: boolean;
        }>) | undefined;
        autocompleteFn?: ((config: any) => Promise<any>) | undefined;
        maskFn?: ((config: any) => Promise<any>) | undefined;
        multiselectFn?: ((config: any) => Promise<any>) | undefined;
        datetimeFn?: ((config: any) => Promise<any>) | undefined;
        confirmFn?: ((config: any) => Promise<any>) | undefined;
        sliderFn?: ((config: any) => Promise<{
            value: number | undefined;
            cancelled: boolean;
        }>) | undefined;
        toggleFn?: ((config: any) => Promise<{
            value: boolean | undefined;
            cancelled: boolean;
        }>) | undefined;
        console?: any;
        t?: Function | undefined;
        maxRetries?: number | undefined;
    };
    t: Function;
    select: typeof select | ((config: any) => Promise<{
        index: number;
        value: any;
        cancelled?: boolean;
    }>);
    get fields(): any[];
    /**
     * Prompts for input using the internal handler.
     *
     * @param {string} prompt - Input prompt.
     * @returns {Promise<Input>} Input result.
     */
    input(prompt: string, field?: {}): Promise<Input>;
    /**
     * Prompts for input, validates, and updates the model.
     * Supports linear navigation (::prev/::next) and all advanced CLI types.
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
     * @param {any} value - Input value.
     * @returns {string|number|boolean} Typed value.
     */
    convertValue(field: any, value: any): string | number | boolean;
    /** @returns {Object} The updated model instance or state object. */
    get body(): any;
    #private;
}
import { UiForm } from '@nan0web/ui';
import { select } from './select.js';
import { Input } from './input.js';
