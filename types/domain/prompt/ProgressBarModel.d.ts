/**
 * Model describing the ProgressBar component parameters.
 */
export class ProgressBarModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_ERROR: {
        alias: string;
        default: string;
    };
    static initial: {
        default: number;
    };
    static total: {
        default: number;
    };
    /**
     * @param {Partial<ProgressBarModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ProgressBarModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Error message. */ UI_ERROR: string;
    /** @type {number} Initial value. */ initial: number;
    /** @type {number} Total value. */ total: number;
}
import { Model } from '@nan0web/types';
