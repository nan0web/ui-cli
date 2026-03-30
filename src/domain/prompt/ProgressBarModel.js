import { Model } from '@nan0web/types'

/**
 * Model describing the ProgressBar component parameters.
 */
export class ProgressBarModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Progress' }
	static help = 'Visual task completion indicator.'
	static UI_ERROR = { alias: 'error', default: 'Error' }
	static initial = { default: 0 }
	static total = { default: 100 }

	/**
	 * @param {Partial<ProgressBarModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Error message. */ this.UI_ERROR
		/** @type {number} Initial value. */ this.initial
		/** @type {number} Total value. */ this.total
	}
}
