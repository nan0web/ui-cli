/**
 * Model describing the Tree navigation component parameters.
 */
export class TreeModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT_SINGLE: {
        default: string;
    };
    static UI_HINT_MULTI: {
        default: string;
    };
    static UI_EMPTY: {
        default: string;
    };
    static UI_LOADING: {
        default: string;
    };
    static UI_SELECTED: {
        default: string;
    };
    /**
     * @param {Partial<TreeModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<TreeModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {boolean} Selection mode. */ multiple: boolean;
    /** @type {string} Instruction hint. */ UI_HINT: string;
}
import { Model } from '@nan0web/types';
