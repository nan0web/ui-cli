import { Model } from '@nan0web/types'

/**
 * Model describing the Pause component.
 */
export class PauseModel extends Model {
	static ms = { default: 1000 }
	static help = 'Duration to pause execution in milliseconds.'

	/**
	 * @param {Partial<PauseModel> | Record<string, any> | number} [data] Input model data or milliseconds.
	 */
	constructor(data = {}) {
		if (typeof data === 'number') data = { ms: data }
		super(data)
		/** @type {number} Duration in milliseconds. */ this.ms
	}
}
