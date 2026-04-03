/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 *
 * It automatically handles:
 * 1. DB Mounting (Sovereign Local + Home ~/ namespaces)
 * 2. i18n Initialization (Sovereign i18n Protocol)
 * 3. Argument Parsing (Model-as-Schema)
 * 4. Generator Execution Loop (runGenerator)
 * 5. Process Exit Lifecycle
 */
export function bootstrapApp(AppModel: any, config?: {}): Promise<{
    success: boolean;
    data: any;
    cancelled: boolean;
}>;
