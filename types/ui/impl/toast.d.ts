/**
 * Renders a toast message.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @returns {string} Styled string.
 */
export function toast(message: string, variant?: "info" | "success" | "warning" | "error"): string;
