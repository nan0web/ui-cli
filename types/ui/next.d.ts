/**
 * Pause execution for a given amount of milliseconds.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<true>} Resolves with `true` after the timeout.
 */
export function pause(ms: number): Promise<true>;
/**
 * Wait for any key press (or a specific sequence).
 *
 * @param {string|string[]|undefined} [conf] - Expected key or sequence.
 * @returns {Promise<string>} The captured key/sequence.
 * @throws {Error} If stdin is already in raw mode.
 */
export function next(conf?: string | string[] | undefined): Promise<string>;
