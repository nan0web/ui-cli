import { Model } from '@nan0web/types'

/**
 * Model describing the Next component parameters.
 * English-only schema for Linguistic Sovereignty.
 */
export class NextModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Continue' }
	static help = 'Text to display before waiting for user action.'

	/**
	 * @param {Partial<NextModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
	}
}
