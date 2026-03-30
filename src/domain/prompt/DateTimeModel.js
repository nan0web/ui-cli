import { Model } from '@nan0web/types'

/**
 * Model describing the DateTime component parameters.
 */
export class DateTimeModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Pick a date' }
	static help = 'Interactive date and time picker.'
	static initial = { default: null }

	/**
	 * @param {Partial<DateTimeModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {Date|string|number|null} Initial date. */ this.initial
	}
}

