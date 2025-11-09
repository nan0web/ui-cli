/**
 * CommandError – error as path to correct resonance
 *
 * **Philosophy**: Error does not hide. Error opens path to correct resonance.
 */
export default class CommandError extends Error {
	/**
	 * Creates a command execution error
	 *
	 * @param {string} message - Message that opens the path
	 * @param {Object} [data=null] - Data to help find correct resonance
	 */
	constructor(message, data = null) {
		super(message)
		this.name = "CommandError"
		this.data = data
		Error.captureStackTrace(this, CommandError)
	}

	/**
	 * @returns {string} Full error context as path for resonance correction
	 */
	toString() {
		return this.data
			? `${this.message}\n${JSON.stringify(this.data, null, 2)}`
			: this.message
	}
}