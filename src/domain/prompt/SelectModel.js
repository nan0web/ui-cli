import { Model } from '@nan0web/types'

/**
 * Model describing the Select component (Radio-button list).
 */
export class SelectModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Select an option' }
	static help = { default: 'Standard radio-button selection list.' }
	static UI_HINT = { alias: 'hint', default: 'Use arrow-keys. Enter to select. TAB for search.' }
	static UI_MORE = { default: 'more' }
	static UI_RESULT = { default: 'Result' }
	static UI_PROMPT = { default: 'Select field to edit:' }
	static initial = { default: 0 }
	static options = { default: [] }

	/**
	 * @param {Partial<SelectModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Hint text. */ this.UI_HINT
		/** @type {string} More label. */ this.UI_MORE
		/** @type {string} Result label. */ this.UI_RESULT
		/** @type {string} Prompt label. */ this.UI_PROMPT
		/** @type {number} Initial index. */ this.initial
		/** @type {Array<any>} Options array. */ this.options
	}
}
