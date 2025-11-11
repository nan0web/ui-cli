/**
 * CommandError – error class representing a failure during command execution.
 *
 * @module CommandError
 */
/**
 * @class
 * @extends Error
 */
export default class CommandError extends Error {
    /**
     * Creates a command execution error.
     *
     * @param {string} message - Message that opens the path.
     * @param {Object} [data=null] - Data to help find correct resonance.
     */
    constructor(message: string, data?: any);
    data: any;
}
