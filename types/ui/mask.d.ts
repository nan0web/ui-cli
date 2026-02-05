/**
 * Validates and optionally formats user input based on a pattern.
 * Pattern uses '#' for numbers and 'A' for letters.
 * Example: '(###) ###-####'
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '###-###')
 * @param {string} [config.placeholder] - Hint for the user
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
/**
 * Formats a value according to the given mask.
 * pattern: # = digit, A = letter, 0 = digit.
 *
 * @param {string} value
 * @param {string} mask
 * @returns {string}
 */
export function formatMask(value: string, mask: string): string;
export function mask(config: any): Promise<{
    value: string;
    cancelled: boolean;
}>;
