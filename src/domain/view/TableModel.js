/**
 * Model describing the Table component parameters.
 */
export class TableModel {
	static UI = 'Data Table'
	static help = 'Interactive table with filtering and sorting.'
	static UI_FILTER = 'filter'
	static UI_NONE = 'none'
	static UI_FILTER_PROMPT = 'Enter text to filter or type exit to quit'

	/**
	 * @param {Object} props 
	 */
	constructor(props = {}) {
		Object.assign(this, props)
		this.UI = props.UI || props.title || TableModel.UI
		this.data = props.data || []
		this.columns = props.columns || []
		this.interactive = props.interactive !== false
	}
}
