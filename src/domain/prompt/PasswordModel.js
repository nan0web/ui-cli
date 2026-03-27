/**
 * Model describing the Password component parameters.
 */
export class PasswordModel {
	static UI = 'Enter password'
	static help = 'Secure mask for the password input field.'
	static initial = ''

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || PasswordModel.UI
		this.initial = props.initial !== undefined ? props.initial : PasswordModel.initial
		this.validate = props.validate || props.validator
	}
}
