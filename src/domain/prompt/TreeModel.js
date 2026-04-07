import { Model } from '@nan0web/types'

/**
 * Model describing the Tree navigation component parameters.
 */
export class TreeModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Select a file' }
	static help = { default: 'Recursive file or object tree selection.' }
	static UI_HINT_SINGLE = { default: 'Use arrow-keys. Enter to select. TAB for search.' }
	static UI_HINT_MULTI = { default: 'Use arrow-keys. Space to toggle. Enter to submit. TAB for search.' }
	static UI_EMPTY = { default: '(empty)' }
	static UI_LOADING = { default: '(loading...)' }
	static UI_SELECTED = { default: 'selected' }

	/**
	 * @param {Partial<TreeModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {boolean} Selection mode. */ this.multiple
		/** @type {string} Instruction hint. */ this.UI_HINT = this.multiple ? TreeModel.UI_HINT_MULTI.default : TreeModel.UI_HINT_SINGLE.default
	}
}
