/**
 * BuildCommand — Orchestrates Vite project build and static pages export.
 */
export class BuildCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        building: string;
        buildFailed: string;
        done: string;
        errorSpawn: string;
        skipBuild: string;
    };
    /**
     * @param {Partial<BuildCommand>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<BuildCommand>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {string} Project data location */ data: string;
    /** @type {string} Project locale */ locale: string;
    /** @type {string} Directory index path */ index: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
