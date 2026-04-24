/**
 * Model describing the Multiselect component (Checkboxes).
 */
export class MultiselectModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static UI_HELP: {
        default: string;
    };
    static UI_INSTRUCTIONS: {
        default: string;
    };
    static UI_HIGHLIGHT: {
        default: string;
    };
    static UI_TOGGLE: {
        default: string;
    };
    static UI_TOGGLE_ALL: {
        default: string;
    };
    static UI_COMPLETE: {
        default: string;
    };
    static options: {
        default: never[];
    };
    /**
     * @param {Partial<MultiselectModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<MultiselectModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {string} Hint text. */ UI_HINT: string;
    /** @type {string} Help text. */ UI_HELP: string;
    /** @type {string} Instructions. */ UI_INSTRUCTIONS: string;
    /** @type {string} Highlight label. */ UI_HIGHLIGHT: string;
    /** @type {string} Toggle label. */ UI_TOGGLE: string;
    /** @type {string} Toggle all label. */ UI_TOGGLE_ALL: string;
    /** @type {string} Complete label. */ UI_COMPLETE: string;
    /** @type {Array<any>} Options array. */ options: Array<any>;
    /**
     * Map a predefined comma-separated answer to a multiselect result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: any[], cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: any[];
        cancelled: boolean;
    };
}
import { Model } from '@nan0web/types';
