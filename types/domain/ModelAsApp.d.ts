export class ModelAsApp extends ModelAsAppUi {
    static help: {
        help: string;
        default: boolean;
    };
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
