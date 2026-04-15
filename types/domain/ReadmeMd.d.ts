export class ReadmeMd extends ModelAsApp {
    static UI: {
        title: string;
        success: string;
    };
    static target: {
        default: string;
        help: string;
    };
    static data: {
        default: string;
        help: string;
    };
    static root: {
        alias: string;
        default: string;
        help: string;
    };
    /**
     * @param {Partial<ReadmeMd>} data
     * @param {import('@nan0web/ui').ModelAsAppOptions} options
     */
    constructor(data?: Partial<ReadmeMd>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {string} Source file to parse docs from (with `@docs` blocks) */ target: string;
    /** @type {string} Directory to save generated documentation */ data: string;
    /** @type {string} Root index file name */ root: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from './ModelAsApp.js';
