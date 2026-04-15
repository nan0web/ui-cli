/**
 * Universal Entry App Loop for OLMUI Apps.
 * Infinitely loops over an App/Entry Model until user fully exits.
 *
 * @param {typeof Object|Function} AppEntryModel - The main application entry point class
 * @param {import('./InputAdapter.js').default} adapter - The CLI adapter
 * @param {Object} options
 */
export function runApp(AppEntryModel: typeof Object | Function, adapter: import("./InputAdapter.js").default, options?: any): Promise<void>;
/**
 * Executes an OLMUI intent generator, mapping intents to CLI adapter methods.
 *
 * @param {import('@nan0web/ui').ModelAsApp} model - Pre-instantiated model possessing a run() generator
 * @param {import('./InputAdapter.js').default} adapter - CLI Adapter
 * @param {Object} options
 */
export function runGenerator(model: import("@nan0web/ui").ModelAsApp, adapter: import("./InputAdapter.js").default, options?: any): Promise<{
    success: boolean;
    data: any;
    cancelled: boolean;
}>;
