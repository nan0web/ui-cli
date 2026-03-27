/**
 * Renders an alert box and optionally plays a sound.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @param {Object} [options]
 * @param {string} [options.title] - Optional title.
 * @param {boolean} [options.sound=false] - Play beep sound.
 * @returns {string} Styled message block.
 */
export function alert(message: string, variant?: "info" | "success" | "warning" | "error", options?: {
    title?: string | undefined;
    sound?: boolean | undefined;
}): string;
