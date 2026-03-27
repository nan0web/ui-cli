/**
 * Model describing the ProgressBar component parameters.
 */
export class ProgressBarModel {
	static UI = 'Progress'
	static help = 'Visual task completion indicator.'
	static UI_ERROR = 'Error'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || ProgressBarModel.UI
		this.UI_ERROR = props.UI_ERROR || props.error || ProgressBarModel.UI_ERROR
		this.initial = props.initial || 0
		this.total = props.total || 100
	}
}
