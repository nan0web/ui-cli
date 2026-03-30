/**
 * Model describing the Confirm component (Yes/No prompt).
 */
export class ConfirmModel extends Model {
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
     * @param {Partial<ConfirmModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ConfirmModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Yes label. */ UI_YES: string;
    /** @type {string} No label. */ UI_NO: string;
    /** @type {boolean} Initial value. */ initial: boolean;
}
import { Model } from '@nan0web/types';
