/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=true] - Default value (true=Yes, false=No)
 * @param {Function} [config.format] - Output value formatter
 * @param {string} [config.active] - Label for "Yes" state
 * @param {string} [config.inactive] - Label for "No" state
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export function confirm(config: {
    message: string;
    initial?: boolean | undefined;
    format?: Function | undefined;
    active?: string | undefined;
    inactive?: string | undefined;
    t?: Function | undefined;
}): Promise<{
    value: boolean;
    cancelled: boolean;
}>;
