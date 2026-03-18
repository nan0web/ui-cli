/**
 * Interactive formatted mask input.
 *
 * NOTE: Predefined/test answers are handled upstream by InputAdapter.requestMask
 * via answerQueue. This function only runs in interactive TTY mode.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '+38 (099) 999 9999')
 * @param {string} [config.placeholder] - Character or string placeholder
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
export function mask(config: {
    message: string;
    mask: string;
    placeholder?: string | undefined;
    t?: Function | undefined;
}): Promise<{
    value: string;
    cancelled: boolean;
}>;
