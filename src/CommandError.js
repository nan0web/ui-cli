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
	constructor(message, data = null) {
		super(message)
		this.name = "CommandError"
		this.data = data
		Error.captureStackTrace(this, CommandError)
	}

	/**
	 * Render the error as a string, optionally including attached data.
	 *
	 * @returns {string}
	 */
	toString() {
		return this.data
			? `${this.message}\n${JSON.stringify(this.data, null, 2)}`
			: this.message
	}
}