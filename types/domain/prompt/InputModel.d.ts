/**
 * Model describing the Input component parameters.
 */
export class InputModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static initial: {
        alias: string;
        default: string;
    };
    static type: {
        default: string;
    };
    static validate: {
        alias: string;
    };
    static format: {
        default: null;
    };
    /**
     * @param {Partial<InputModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<InputModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Initial value. */ initial: string;
    /** @type {string} Input type. */ type: string;
    /** @type {(input?: any, answers?: any) => any} Validation function. */ validate: (input?: any, answers?: any) => any;
    /** @type {string|null} Format string. */ format: string | null;
}
import { Model } from '@nan0web/types';
