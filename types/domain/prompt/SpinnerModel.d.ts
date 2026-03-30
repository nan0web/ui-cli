/**
 * Model describing the Spinner activity component.
 */
export class SpinnerModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_DONE: {
        alias: string;
        default: string;
    };
    static UI_ERROR: {
        alias: string;
        default: string;
    };
    /**
     * @param {Partial<SpinnerModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SpinnerModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Status on completion. */ UI_DONE: string;
    /** @type {string} Status on error. */ UI_ERROR: string;
}
import { Model } from '@nan0web/types';
