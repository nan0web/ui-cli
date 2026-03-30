import { Model } from '@nan0web/types'

/**
 * Model describing the Table component parameters.
 */
export class TableModel extends Model {
	static UI = { alias: ['title', 'label', 'labels'], default: 'Data Table' }
	static help = 'Interactive table with filtering and sorting.'
	static UI_FILTER = { default: 'filter' }
	static UI_NONE = { default: 'none' }
	static UI_FILTER_PROMPT = { default: 'Enter text to filter or type exit to quit' }
	static data = { default: [] }
	static columns = { default: [] }
	static interactive = { default: true }

	/**
	 * @param {Partial<TableModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Table title/label. */ this.UI
		/** @type {string} Filter label. */ this.UI_FILTER
		/** @type {string} None label. */ this.UI_NONE
		/** @type {string} Filter prompt. */ this.UI_FILTER_PROMPT
		/** @type {Array<any>} Table rows. */ this.data
		/** @type {Array<any>} Column definitions. */ this.columns
		/** @type {boolean} Interaction toggle. */ this.interactive
	}
}
