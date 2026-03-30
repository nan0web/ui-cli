import { Model } from '@nan0web/types'

/**
 * Model describing the Toggle (Yes/No Switch) component.
 */
export class ToggleModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Toggle' }
	static help = 'Standard boolean switch (classic Yes/No toggle).'
	static UI_YES = { alias: 'active', default: 'yes' }
	static UI_NO = { alias: 'inactive', default: 'no' }
	static initial = { default: false }

	/**
	 * @param {Partial<ToggleModel> | Record<string, any> | boolean} [data] Input model data or initial state.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		if (typeof data === 'boolean') data = { initial: data }
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Active label. */ this.UI_YES
		/** @type {string} Inactive label. */ this.UI_NO
		/** @type {boolean} Initial state. */ this.initial
	}
}
