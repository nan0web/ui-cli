/**
 * Model describing the Autocomplete component parameters.
 */
export class AutocompleteModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static options: {
        default: never[];
    };
    /**
     * @param {Partial<AutocompleteModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<AutocompleteModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Tip Type to filter the list. */ UI_HINT: string;
    /** @type {Array<any>} Options array. */ options: Array<any>;
}
import { Model } from '@nan0web/types';
