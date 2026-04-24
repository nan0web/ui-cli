/**
 * CliCommand — Launches the sub-application interactive CLI as a child process.
 */
export class CliCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        launching: string;
        errorSpawn: string;
        errorNotFound: string;
        errorExit: string;
        errorFailed: string;
    };
    /**
     * @param {Partial<CliCommand>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<CliCommand>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {string} Sub-app locale */ locale: string;
    /** @type {string} Sub-app data location */ data: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
