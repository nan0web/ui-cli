import { Model } from '@nan0web/types'

/**
 * Model describing the Confirm component (Yes/No prompt).
 */
export class ConfirmModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Are you sure?' }
	static help = { default: 'Question to be confirmed by user.' }
	static UI_YES = { alias: 'active', default: 'yes' }
	static UI_NO = { alias: 'inactive', default: 'no' }
	static initial = { default: false }

	/**
	 * @param {Partial<ConfirmModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Yes label. */ this.UI_YES
		/** @type {string} No label. */ this.UI_NO
		/** @type {boolean} Initial value. */ this.initial
	}
}
