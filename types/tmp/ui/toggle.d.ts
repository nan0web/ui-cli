/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=false]
 * @param {string} [config.active='yes']
 * @param {string} [config.inactive='no']
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export function toggle(config: {
    message: string;
    initial?: boolean;
    active?: string;
    inactive?: string;
}): Promise<{
    value: boolean;
    cancelled: boolean;
}>;
