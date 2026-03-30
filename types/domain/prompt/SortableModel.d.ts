/**
 * Model describing the Sortable component parameters.
 */
export class SortableModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static UI_NAV: {
        default: string;
    };
    static UI_GRAB: {
        default: string;
    };
    static UI_CONFIRM: {
        default: string;
    };
    static items: {
        default: never[];
    };
    /**
     * @param {Partial<SortableModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SortableModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Hint text. */ UI_HINT: string;
    /** @type {string} Navigation instructions. */ UI_NAV: string;
    /** @type {string} Grab instructions. */ UI_GRAB: string;
    /** @type {string} Confirm message. */ UI_CONFIRM: string;
    /** @type {Array<any>} Items to sort. */ items: Array<any>;
}
import { Model } from '@nan0web/types';
