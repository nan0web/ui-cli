/**
 * DevCommand — Starts Vite development server with Hot Module Replacement.
 */
export class DevCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        starting: string;
        errorSpawn: string;
        errorNoEntry: string;
    };
    /**
     * @param {Partial<DevCommand>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<DevCommand>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
