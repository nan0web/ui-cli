/**
 * Model describing the Slider (Number range) component.
 */
export class SliderModel {
	static UI = 'Value'
	static help = 'Interactive number range selector.'
	static min = 0
	static max = 100
	static step = 1
	static initial = 50

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || SliderModel.UI
		this.min = props.min !== undefined ? props.min : SliderModel.min
		this.max = props.max !== undefined ? props.max : SliderModel.max
		this.step = props.step !== undefined ? props.step : SliderModel.step
		this.initial = props.initial !== undefined ? props.initial : SliderModel.initial
	}
}
