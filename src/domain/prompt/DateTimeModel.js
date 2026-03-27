/**
 * Model describing the DateTime component parameters.
 */
export class DateTimeModel {
	static UI = 'Pick a date'
	static help = 'Interactive date and time picker.'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || DateTimeModel.UI
		this.initial = props.initial instanceof Date ? props.initial : new Date()
	}
}
