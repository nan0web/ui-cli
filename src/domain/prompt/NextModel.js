/**
 * Model describing the Next component parameters.
 * English-only schema for Linguistic Sovereignty.
 */
export class NextModel {
	static UI = 'Continue'
	static help = 'Text to display before waiting for user action.'
	
	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI !== undefined ? props.UI : NextModel.UI
	}
}
