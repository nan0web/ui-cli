import { Model } from '@nan0web/types'
import { MaskHandler } from '@nan0web/ui/core'

/**
 * Model describing the Mask component parameters.
 */
export class MaskModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Value' }
	static help = { default: 'Input field with fixed formatting mask (e.g. phone number).' }
	static UI_FORMAT_MSG = { default: 'Format must be' }
	static mask = { default: '' }

	/**
	 * @param {Partial<MaskModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Format message. */ this.UI_FORMAT_MSG
		/** @type {string} The mask. */ this.mask
	}

	/**
	 * Map a predefined answer to a masked result.
	 *
	 * @param {string} predefined - Injected answer.
	 * @returns {{value: string, cancelled: boolean}}
	 */
	automatedInput(predefined) {
		const mh = new MaskHandler(this.mask)
		mh.setValue(predefined)
		return { value: mh.formatted, cancelled: false }
	}
}
