/**
 * Model describing the Password component parameters.
 */
export class PasswordModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static initial: {
        default: string;
    };
    static validate: {
        alias: string;
    };
    /**
     * @param {Partial<PasswordModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<PasswordModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Initial value. */ initial: string;
    /** @type {(input?: any, answers?: any) => any} Validation function. */ validate: (input?: any, answers?: any) => any;
}
import { Model } from '@nan0web/types';
