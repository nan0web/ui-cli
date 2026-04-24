export class ShellModel extends ModelAsApp {
    static $id: string;
    static command: {
        help: string;
        type: string;
        default: null;
        positional: boolean;
        options: (typeof RunCommand | typeof CliCommand | typeof DevCommand | typeof BuildCommand | typeof ConfigCommand)[];
        required: boolean;
    };
    /**
     * @param {Partial<ShellModel>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<ShellModel>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {ModelAsApp | string | null} What do you want to do? */ command: ModelAsApp | string | null;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '../ModelAsApp.js';
import { RunCommand } from './RunCommand.js';
import { CliCommand } from './CliCommand.js';
import { DevCommand } from './DevCommand.js';
import { BuildCommand } from './BuildCommand.js';
import { ConfigCommand } from './ConfigCommand.js';
