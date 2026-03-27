/**
 * Model describing the Input component parameters.
 */
export class InputModel {
	static UI = 'Enter value'
	static help = 'Question or label for the input fields.'
	static initial = ''
	static type = 'text'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || InputModel.UI
		this.initial = props.initial !== undefined ? props.initial : (props.defaultValue || InputModel.initial)
		this.type = props.type || InputModel.type
		this.validate = props.validate || props.validator
		this.format = props.format
	}
}
