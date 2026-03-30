import { Model } from '@nan0web/types'

/**
 * Model describing the Sortable component parameters.
 */
export class SortableModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Reorder items' }
	static help = 'Interactive drag-and-drop item reordering.'
	static UI_HINT = { alias: 'hint', default: 'Use arrow-keys. Space to grab. Enter to confirm. TAB for search.' }
	static UI_NAV = { default: 'Use arrow-keys. Space to grab. Enter to confirm. TAB for search.' }
	static UI_GRAB = { default: 'Use arrow-keys. Space to drop. Enter to confirm.' }
	static UI_CONFIRM = { default: 'Items reordered.' }
	static items = { default: [] }

	/**
	 * @param {Partial<SortableModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Hint text. */ this.UI_HINT
		/** @type {string} Navigation instructions. */ this.UI_NAV
		/** @type {string} Grab instructions. */ this.UI_GRAB
		/** @type {string} Confirm message. */ this.UI_CONFIRM
		/** @type {Array<any>} Items to sort. */ this.items
	}
}
