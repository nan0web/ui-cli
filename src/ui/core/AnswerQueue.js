/**
 * Manages the predefined answer queue for automated UI-CLI interactions.
 * Helps isolated tests and playground demos function correctly.
 */
export default class AnswerQueue {
	/** @type {string[]} Queue of predefined answers. */
	#answers = []
	/** @type {number} Current position in the answers queue. */
	#cursor = 0
	/** @type {boolean} Temporarily disable automated answers */
	_disableNextAnswerLookup = false

	constructor(options = {}) {
		const {
			predefined = process.env.PLAY_DEMO_SEQUENCE ?? [],
			divider = process.env.PLAY_DEMO_DIVIDER ?? ',',
		} = options

		if (Array.isArray(predefined)) {
			this.#answers = predefined.map((v) => String(v))
		} else if (typeof predefined === 'string') {
			this.#answers = predefined.split(divider).map((v) => v.trim())
		} else {
			this.#answers = []
		}
	}

	/**
	 * Consume and return the next predefined answer, if any.
	 * Returns null if the queue is empty or disabled.
	 * @returns {string|null}
	 */
	next() {
		if (this._disableNextAnswerLookup) return null 
		if (this.#cursor < this.#answers.length) {
			const val = this.#answers[this.#cursor]
			this.#cursor++
			return val
		}
		return null
	}

	/**
	 * Get the array of remaining answers without consuming them.
	 * @returns {string[]}
	 */
	getRemaining() {
		return this.#answers.slice(this.#cursor)
	}

	/**
	 * @param {boolean} disable
	 */
	setDisabled(disable) {
		this._disableNextAnswerLookup = disable
	}
}
