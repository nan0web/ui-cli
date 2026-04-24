/**
 * Handles mapping OLMUI intents to CLI InputAdapter methods.
 * Extracted from CLiInputAdapter to reduce God Object complexity.
 */
export default class IntentDispatcher {
    /**
     * Convert basic markdown formatting to ANSI escape codes.
     * Supports: **bold**, ![alt](url) → 🖼 alt
     *
     * @param {string} text
     * @returns {string}
     */
    static "__#private@#markdownToAnsi"(text: string): string;
    /**
     * @param {import('./InputAdapter.js').default & {renderForm?: Function}} adapter
     */
    constructor(adapter: import("./InputAdapter.js").default & {
        renderForm?: Function;
    });
    adapter: import("./InputAdapter.js").default & {
        renderForm?: Function;
    };
    /**
     * Map an OLMUI Intent to the corresponding CLI interaction.
     *
     * @param {Object} intent
     * @returns {Promise<{value: any, cancelled: boolean}>}
     */
    askIntent(intent: any): Promise<{
        value: any;
        cancelled: boolean;
    }>;
    /**
     * Handle OLMUI Log intents.
     * Multi-line messages are rendered via Alert box.
     * Supports basic markdown: **bold** → ANSI bold.
     *
     * @param {Object} intent
     */
    logIntent(intent: any): Promise<void>;
    /**
     * Handle OLMUI Result intents.
     *
     * @param {Object} intent
     */
    resultIntent(intent: any): Promise<void>;
    progressIntent(intent: any): Promise<{
        onData: (chunk: any) => void;
        onEnd: () => void;
    } | undefined>;
    #private;
}
