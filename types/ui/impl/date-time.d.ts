/**
 * Prompt user for a date or time.
 *
 * @param {Object} config
 * @param {string} config.message
 * @param {Date} [config.initial]
 * @param {string} [config.mask] - Optional mask (e.g. 'YYYY-MM-DD HH:mm')
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:Date, cancelled:boolean}>}
 */
export function datetime(config: {
    message: string;
    initial?: Date | undefined;
    mask?: string | undefined;
    t?: Function | undefined;
}): Promise<{
    value: Date;
    cancelled: boolean;
}>;
