export class ModelAsApp extends ModelAsAppUi {
    static help: {
        help: string;
        default: boolean;
    };
    /**
     * Execute the model programmatically without a UI adapter.
     * Instantiates the class and drains the `run()` generator, suppressing visual intents
     * (ask, log, render) but automatically providing necessary context if available.
     * Useful for backend scripts, docs generation (`ReadmeMd`), or API integrations.
     * @param {any} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     * @returns {Promise<any>}
     */
    static execute(data?: any, options?: import("@nan0web/ui").ModelAsAppOptions): Promise<any>;
    /**
     * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options={}]
     */
    constructor(data?: Partial<ModelAsApp> | Record<string, any>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {boolean} Show help */ help: boolean;
    /**
     * Instantiates a subcommand if the value matches one of the options.
     * @param {string} key - Field name.
     * @param {any} val - Current value (string, class, or instance).
     * @param {any} [data={}] - Data to pass to the new instance.
     * @returns {any} Instantiated subcommand or original value.
     */
    _instantiateSubCommand(key: string, val: any, data?: any): any;
    /**
     * Generate help text for the model
     * @example
     * ```
     * import { StatusCommand } from './StatusCommand.js'
     * import { PullCommand } from './PullCommand.js'
     * class App extends ModelAsApp {
     * 	static alias = 'nan0cli'
     * 	static UI = {
     * 		title: 'App',
     * 		description: 'App description',
     * 		usageTitle: 'Usage:',
     * 		usageExamples: ['App example'],
     * 		optionsTitle: 'Options:',
     * 	}
     * 	static command = {
     * 		description: 'Command description',
     *		options: [StatusCommand, PullCommand],
     * 		positional: true,
     * 		required: true,
     * 		default: StatusCommand,
     * 	}
     * }
     * const app = new App()
     * console.info(app.generateHelp())
     * ```
     * @param {string} [parentPath]
     * @returns {string}
     */
    generateHelp(parentPath?: string): string;
}
import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui';
