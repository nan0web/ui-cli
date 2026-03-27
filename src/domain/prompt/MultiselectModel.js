/**
 * Model describing the Multiselect component (Checkboxes).
 */
export class MultiselectModel {
	static UI = 'Select options'
	static help = 'Standard multi-selection checkboxes.'
	static UI_HINT = 'Use arrow-keys. Space to toggle. Enter to submit. TAB for search.'
	static UI_HELP = 'Instructions'
	static UI_INSTRUCTIONS = 'Instructions'
	static UI_HIGHLIGHT = 'Highlight option'
	static UI_TOGGLE = 'Toggle selection'
	static UI_TOGGLE_ALL = 'Toggle all'
	static UI_COMPLETE = 'Complete answer'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || MultiselectModel.UI
		this.UI_HINT = props.UI_HINT || props.hint || MultiselectModel.UI_HINT
		this.options = props.options || []
	}
}
