/**
 * Manages the predefined answer queue for automated UI-CLI interactions.
 * Helps isolated tests and playground demos function correctly.
 */
export default class AnswerQueue {
	constructor(options = {}) {
		this._answers = []
		this._cursor = 0

		/** @type {boolean} Temporarily disable automated answers */
		this._disableNextAnswerLookup = false

		const {
			predefined = options.predefined ?? process.env.UI_ANSWERS ?? process.env.PLAY_DEMO_SEQUENCE ?? [],
			divider = options.divider ?? process.env.PLAY_DEMO_DIVIDER ?? ',',
		} = options

		if (Array.isArray(predefined)) {
			this._answers = predefined.map((v) => String(v))
		} else if (typeof predefined === 'string') {
			this._answers = predefined.split(divider).map((v) => v.trim())
		} else {
			this._answers = []
		}
	}

	/**
	 * Consume and return the next predefined answer, if any.
	 * Returns null if the queue is empty or disabled.
	 * @returns {string|null}
	 */
	next() {
		if (this._disableNextAnswerLookup) return null 
		if (this._cursor < this._answers.length) {
			const val = this._answers[this._cursor]
			this._cursor++
			return val
		}
		return null
	}

	/**
	 * Get the array of remaining answers without consuming them.
	 * @returns {string[]}
	 */
	getRemaining() {
		return this._answers.slice(this._cursor)
	}

	/**
	 * @param {boolean} disable
	 */
	setDisabled(disable) {
		this._disableNextAnswerLookup = disable
	}
}
