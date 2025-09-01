/**
 * Waits for the confirmation message (input) from user
 * @param {string | string[] | undefined} conf - Confirmation message or one of messages if array or any if undefined.
 * @returns {Promise<string>}
 */
export function next(conf: string | string[] | undefined): Promise<string>;
/**
 * Make a pause.
 * @param {number} ms - Amount in miliseconds
 * @returns {Promise<void>}
 */
export function pause(ms: number): Promise<void>;
