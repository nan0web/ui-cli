/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=true] - Default value (true=Yes, false=No)
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export function confirm(config: {
    message: string;
    initial?: boolean | undefined;
}): Promise<{
    value: boolean;
    cancelled: boolean;
}>;
export default confirm;
