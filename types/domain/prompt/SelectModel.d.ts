/**
 * Model describing the Select component (Radio-button list).
 */
export class SelectModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: {
        default: string;
    };
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static UI_MORE: {
        default: string;
    };
    static UI_RESULT: {
        default: string;
    };
    static UI_PROMPT: {
        default: string;
    };
    static initial: {
        default: number;
    };
    static options: {
        default: never[];
    };
    /**
     * @param {Partial<SelectModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SelectModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Hint text. */ UI_HINT: string;
    /** @type {string} More label. */ UI_MORE: string;
    /** @type {string} Result label. */ UI_RESULT: string;
    /** @type {string} Prompt label. */ UI_PROMPT: string;
    /** @type {number} Initial index. */ initial: number;
    /** @type {Array<any>} Options array. */ options: Array<any>;
}
import { Model } from '@nan0web/types';
