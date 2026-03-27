/**
 * Model describing the Pause component.
 */
export class PauseModel {
	static ms = 1000
	static help = 'Duration to pause execution in milliseconds.'

	/**
	 * @param {Object|number} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'number') props = { ms: props }
		Object.assign(this, props)
		this.ms = props.ms !== undefined ? props.ms : PauseModel.ms
	}
}
