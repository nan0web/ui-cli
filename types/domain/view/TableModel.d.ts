/**
 * Model describing the Table component parameters.
 */
export class TableModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_FILTER: {
        default: string;
    };
    static UI_NONE: {
        default: string;
    };
    static UI_FILTER_PROMPT: {
        default: string;
    };
    static data: {
        default: never[];
    };
    static columns: {
        default: never[];
    };
    static interactive: {
        default: boolean;
    };
    /**
     * @param {Partial<TableModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<TableModel> | Record<string, any>, options?: object);
    /** @type {string} Table title/label. */ UI: string;
    /** @type {string} Filter label. */ UI_FILTER: string;
    /** @type {string} None label. */ UI_NONE: string;
    /** @type {string} Filter prompt. */ UI_FILTER_PROMPT: string;
    /** @type {Array<any>} Table rows. */ data: Array<any>;
    /** @type {Array<any>} Column definitions. */ columns: Array<any>;
    /** @type {boolean} Interaction toggle. */ interactive: boolean;
}
import { Model } from '@nan0web/types';
