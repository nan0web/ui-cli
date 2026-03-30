import { Model } from '@nan0web/types'

/**
 * Model describing the Spinner activity component.
 */
export class SpinnerModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Processing...' }
	static help = 'Animated activity indicator.'
	static UI_DONE = { alias: 'done', default: 'Done' }
	static UI_ERROR = { alias: 'error', default: 'Error' }

	/**
	 * @param {Partial<SpinnerModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Status on completion. */ this.UI_DONE
		/** @type {string} Status on error. */ this.UI_ERROR
	}
}
