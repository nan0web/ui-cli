import { Model } from '@nan0web/types'

/**
 * Model describing the Autocomplete component parameters.
 */
export class AutocompleteModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Choose' }
	static help = 'Searchable input with real-time completion suggestions.'
	static UI_HINT = { alias: 'hint', default: 'Tip Type to filter the list' }
	static options = { default: [] }

	/**
	 * @param {Partial<AutocompleteModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Tip Type to filter the list. */ this.UI_HINT
		/** @type {Array<any>} Options array. */ this.options
	}
}
