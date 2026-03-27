/**
 * Model describing the Mask component parameters.
 */
export class MaskModel {
	static UI = 'Value'
	static help = 'Input field with fixed formatting mask (e.g. phone number).'
	static UI_FORMAT_MSG = 'Format must be'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || MaskModel.UI
		this.mask = props.mask || ''
	}
}
