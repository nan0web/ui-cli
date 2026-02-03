/**
 * Validates and optionally formats user input based on a pattern.
 * Pattern uses '#' for numbers and 'A' for letters.
 * Example: '(###) ###-####'
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '###-###')
 * @param {string} [config.placeholder] - Hint for the user
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
export function mask(config: {
    message: string;
    mask: string;
    placeholder?: string | undefined;
}): Promise<{
    value: string;
    cancelled: boolean;
}>;
