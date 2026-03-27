/**
 * Model describing the Tree navigation component parameters.
 */
export class TreeModel {
	static UI = 'Select a file'
	static help = 'Recursive file or object tree selection.'
	static UI_HINT_SINGLE = 'Use arrow-keys. Enter to select. TAB for search.'
	static UI_HINT_MULTI = 'Use arrow-keys. Space to toggle. Enter to submit. TAB for search.'
	static UI_EMPTY = '(empty)'
	static UI_LOADING = '(loading...)'
	static UI_SELECTED = 'selected'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || TreeModel.UI
		this.multiple = !!props.multiple
		this.UI_HINT = props.multiple ? TreeModel.UI_HINT_MULTI : TreeModel.UI_HINT_SINGLE
	}
}
