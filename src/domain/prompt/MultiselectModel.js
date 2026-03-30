import { Model } from '@nan0web/types'

/**
 * Model describing the Multiselect component (Checkboxes).
 */
export class MultiselectModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Select options' }
	static help = 'Standard multi-selection checkboxes.'
	static UI_HINT = { alias: 'hint', default: 'Use arrow-keys. Space to toggle. Enter to submit. TAB for search.' }
	static UI_HELP = { default: 'Instructions' }
	static UI_INSTRUCTIONS = { default: 'Instructions' }
	static UI_HIGHLIGHT = { default: 'Highlight option' }
	static UI_TOGGLE = { default: 'Toggle selection' }
	static UI_TOGGLE_ALL = { default: 'Toggle all' }
	static UI_COMPLETE = { default: 'Complete answer' }
	static options = { default: [] }

	/**
	 * @param {Partial<MultiselectModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Hint text. */ this.UI_HINT
		/** @type {string} Help text. */ this.UI_HELP
		/** @type {string} Instructions. */ this.UI_INSTRUCTIONS
		/** @type {string} Highlight label. */ this.UI_HIGHLIGHT
		/** @type {string} Toggle label. */ this.UI_TOGGLE
		/** @type {string} Toggle all label. */ this.UI_TOGGLE_ALL
		/** @type {string} Complete label. */ this.UI_COMPLETE
		/** @type {Array<any>} Options array. */ this.options
	}
}
