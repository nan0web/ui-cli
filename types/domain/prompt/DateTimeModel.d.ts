/**
 * Model describing the DateTime component parameters.
 */
export class DateTimeModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static initial: {
        default: null;
    };
    /**
     * @param {Partial<DateTimeModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<DateTimeModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {Date|string|number|null} Initial date. */ initial: Date | string | number | null;
}
import { Model } from '@nan0web/types';
