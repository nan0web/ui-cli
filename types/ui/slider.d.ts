/**
 * @param {Object} config
 * @param {string} config.message
 * @param {number} [config.initial]
 * @param {number} [config.min=0]
 * @param {number} [config.max=100]
 * @param {number} [config.step=1]
 * @param {number} [config.jump]
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:number, cancelled:boolean}>}
 */
export function slider(config: {
    message: string;
    initial?: number | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    jump?: number | undefined;
    t?: Function | undefined;
}): Promise<{
    value: number;
    cancelled: boolean;
}>;
