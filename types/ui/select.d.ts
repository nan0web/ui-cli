/**
 * Generic selection prompt for CLI.
 * Automatically creates its own input handler.
 *
 * @param {Object} config
 * @param {string} config.title - Title shown before the list (e.g. "Select currency:")
 * @param {string} config.prompt - Main prompt text (e.g. "Choose (1-3): ")
 * @param {string} [config.invalidPrompt] - Retry message when input is invalid
 * @param {Array<string> | Map<string, string> | Array<{ label: string, value: string }>} config.options - List of displayable options
 * @param {Object} config.console - Logger (console.info, console.error, etc.)
 * @param {Function} [config.ask] - Input handler
 *
 * @returns {Promise<{ index: number, value: string | null }>} Selected option
 * @throws {CancelError} if the user cancels
 */
export function select({ title, prompt, invalidPrompt, options, console, ask, }: {
    title: string;
    prompt: string;
    invalidPrompt?: string | undefined;
    options: Array<string> | Map<string, string> | Array<{
        label: string;
        value: string;
    }>;
    console: any;
    ask?: Function | undefined;
}): Promise<{
    index: number;
    value: string | null;
}>;
export default select;
