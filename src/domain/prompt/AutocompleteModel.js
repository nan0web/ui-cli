/**
 * Model describing the Autocomplete component parameters.
 */
export class AutocompleteModel {
	static UI = 'Choose'
	static help = 'Searchable input with real-time completion suggestions.'
	static UI_HINT = 'Tip Type to filter the list'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || AutocompleteModel.UI
		this.UI_HINT = props.UI_HINT || props.hint || AutocompleteModel.UI_HINT
		this.options = props.options || []
	}
}
