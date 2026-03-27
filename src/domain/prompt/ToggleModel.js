/**
 * Model describing the Toggle (Yes/No Switch) component.
 */
export class ToggleModel {
	static UI = 'Toggle'
	static help = 'Standard boolean switch (classic Yes/No toggle).'
	static UI_YES = 'yes'
	static UI_NO = 'no'
	static initial = false

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || ToggleModel.UI
		this.UI_YES = props.UI_YES || props.active || ToggleModel.UI_YES
		this.UI_NO = props.UI_NO || props.inactive || ToggleModel.UI_NO
		this.initial = props.initial !== undefined ? !!props.initial : ToggleModel.initial
	}
}
