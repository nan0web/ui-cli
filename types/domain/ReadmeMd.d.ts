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
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(options?: import("@nan0web/ui").ModelAsAppOptions): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from './ModelAsApp.js';
