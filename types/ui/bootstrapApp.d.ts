/**
 * @typedef {Object} BootstrapAppConfig
 * @property {string[]} [argv=process.argv.slice(2)] Arguments of the console app.
 * @property {DB} [db] Root database with mounted all required databases already.
 * @property {object} [env={}] Environment variables.
 * @property {() => string} [cwd=process.cwd] Current working directory function.
 * @property {import('@nan0web/i18n').TFunction} [t] Translation function.
 * @property {boolean} [noExit=false] Provides a result instead of exit when true.
 * @property {string} [root] Optional DB mount root path.
 */
/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 *
 * It automatically handles:
 * 1. DB Mounting (Sovereign Local + Home ~/ namespaces)
 * 2. i18n Initialization (Sovereign i18n Protocol)
 * 3. Argument Parsing (Model-as-Schema)
 * 4. Generator Execution Loop (runGenerator)
 * 5. Process Exit Lifecycle
 * @param {typeof import('@nan0web/types').Model} AppModel
 * @param {BootstrapAppConfig} [config={}]
 */
export function bootstrapApp(AppModel: typeof import("@nan0web/types").Model, config?: BootstrapAppConfig): Promise<{
    success: boolean;
    data: any;
    cancelled: boolean;
}>;
export type BootstrapAppConfig = {
    /**
     * Arguments of the console app.
     */
    argv?: string[] | undefined;
    /**
     * Root database with mounted all required databases already.
     */
    db?: DB | undefined;
    /**
     * Environment variables.
     */
    env?: object;
    /**
     * Current working directory function.
     */
    cwd?: (() => string) | undefined;
    /**
     * Translation function.
     */
    t?: import("@nan0web/types/src/utils/TFunction").TFunction | undefined;
    /**
     * Provides a result instead of exit when true.
     */
    noExit?: boolean | undefined;
    /**
     * Optional DB mount root path.
     */
    root?: string | undefined;
};
import DB from '@nan0web/db';
