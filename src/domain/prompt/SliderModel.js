import { Model } from '@nan0web/types'

/**
 * Model describing the Slider (Number range) component.
 */
export class SliderModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Value' }
	static help = 'Interactive number range selector.'
	static min = { default: 0 }
	static max = { default: 100 }
	static step = { default: 1 }
	static initial = { default: 0 }

	/**
	 * @param {Partial<SliderModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {number} Minimum. */ this.min
		/** @type {number} Maximum. */ this.max
		/** @type {number} Step size. */ this.step
		/** @type {number} Initial value. */ this.initial
	}

	/**
	 * Map a predefined answer to a numeric result.
	 *
	 * @param {string} predefined - Injected answer.
	 * @returns {{value: number, cancelled: boolean}}
	 */
	automatedInput(predefined) {
		return { value: Number(predefined), cancelled: false }
	}
}
