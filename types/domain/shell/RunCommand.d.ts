/**
 * RunCommand — Boots the NaN0Web engine and launches the SSR server.
 */
export class RunCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        errorRunner: string;
        running: string;
        portInUse: string;
    };
    /**
     * @param {Partial<RunCommand>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<RunCommand>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {string} Project data location */ data: string;
    /** @type {string} Server port */ port: string;
    /** @type {string} Project locale */ locale: string;
    /** @type {string} Directory index path */ index: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
