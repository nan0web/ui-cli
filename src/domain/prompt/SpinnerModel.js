/**
 * Model describing the Spinner activity component.
 */
export class SpinnerModel {
	static UI = 'Processing...'
	static help = 'Animated activity indicator.'
	static UI_DONE = 'Done'
	static UI_ERROR = 'Error'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || SpinnerModel.UI
		this.UI_DONE = props.UI_DONE || props.done || SpinnerModel.UI_DONE
		this.UI_ERROR = props.UI_ERROR || props.error || SpinnerModel.UI_ERROR
	}
}
