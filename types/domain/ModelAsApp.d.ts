export class ModelAsApp extends ModelAsAppUi {
    static help: {
        help: string;
        default: boolean;
    };
    static raw: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * Execute the model programmatically without a UI adapter.
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
    /** @type {boolean} Raw output */ raw: boolean;
    /** @type {string} Parent command path for help generation */ parentPath: string;
    /** @internal Flag for explicit instantiation from CLI args */ _isExplicit: boolean;
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
     * @param {string} [parentPath]
     * @returns {string}
     */
    generateHelp(parentPath?: string): string;
}
import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui';
