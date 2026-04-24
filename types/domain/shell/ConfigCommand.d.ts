/**
 * ConfigCommand — Interactive wizard for project configuration.
 */
export class ConfigCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        errorSchema: string;
        done: string;
    };
    /**
     * @param {Partial<ConfigCommand>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<ConfigCommand>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
