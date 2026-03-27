/**
 * Model describing the Select component (Radio-button list).
 */
export class SelectModel {
	static UI = 'Select an option'
	static help = 'Standard radio-button selection list.'
	static UI_HINT = 'Use arrow-keys. Enter to select. TAB for search.'
	static UI_MORE = 'more'
	static UI_RESULT = 'Result'
	static UI_PROMPT = 'Select field to edit:'
	static initial = 0

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || SelectModel.UI
		this.UI_HINT = props.UI_HINT || props.hint || SelectModel.UI_HINT
		this.initial = props.initial !== undefined ? props.initial : SelectModel.initial
		this.options = props.options || []
	}
}
