/**
 * Model describing the Next component parameters.
 * English-only schema for Linguistic Sovereignty.
 */
export class NextModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    /**
     * @param {Partial<NextModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<NextModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
}
import { Model } from '@nan0web/types';
