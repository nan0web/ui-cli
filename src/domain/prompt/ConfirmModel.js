/**
 * Model describing the Confirm component (Yes/No prompt).
 */
export class ConfirmModel {
	static UI = 'Are you sure?'
	static help = 'Question to be confirmed by user.'
	static UI_YES = 'yes'
	static UI_NO = 'no'
	static initial = false

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || ConfirmModel.UI
		this.UI_YES = props.UI_YES || props.active || ConfirmModel.UI_YES
		this.UI_NO = props.UI_NO || props.inactive || ConfirmModel.UI_NO
		this.initial = props.initial !== undefined ? !!props.initial : ConfirmModel.initial
	}
}
