/**
 * Model describing the Toggle (Yes/No Switch) component.
 */
export class ToggleModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_YES: {
        alias: string;
        default: string;
    };
    static UI_NO: {
        alias: string;
        default: string;
    };
    static initial: {
        default: boolean;
    };
    /**
     * @param {Partial<ToggleModel> | Record<string, any> | boolean} [data] Input model data or initial state.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ToggleModel> | Record<string, any> | boolean, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Active label. */ UI_YES: string;
    /** @type {string} Inactive label. */ UI_NO: string;
    /** @type {boolean} Initial state. */ initial: boolean;
}
import { Model } from '@nan0web/types';
