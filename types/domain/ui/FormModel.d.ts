export class FormModel extends Model {
    static UI_VALIDATE_ERROR: {
        default: string;
    };
    static UI_SELECT: {
        default: string;
    };
    static UI_ADD: {
        default: string;
    };
    static UI_DONE: {
        default: string;
    };
    static UI_ACTION: {
        default: string;
    };
    static UI_VALUE: {
        default: string;
    };
    static UI_EDIT: {
        default: string;
    };
    static UI_DELETE: {
        default: string;
    };
    static UI_BACK: {
        default: string;
    };
    static UI_REQUIRED: {
        default: string;
    };
    /**
     * @param {Partial<FormModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<FormModel> | Record<string, any>, options?: object);
    /** @type {string} Validation error label. */ UI_VALIDATE_ERROR: string;
    /** @type {string} Select label. */ UI_SELECT: string;
    /** @type {string} Add label. */ UI_ADD: string;
    /** @type {string} Done label. */ UI_DONE: string;
    /** @type {string} Action label. */ UI_ACTION: string;
    /** @type {string} Value label. */ UI_VALUE: string;
    /** @type {string} Edit label. */ UI_EDIT: string;
    /** @type {string} Delete label. */ UI_DELETE: string;
    /** @type {string} Back label. */ UI_BACK: string;
    /** @type {string} Required field label. */ UI_REQUIRED: string;
}
import { Model } from '@nan0web/types';
