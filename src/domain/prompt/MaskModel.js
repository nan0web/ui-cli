import { Model } from '@nan0web/types'

/**
 * Model describing the Mask component parameters.
 */
export class MaskModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Value' }
	static help = 'Input field with fixed formatting mask (e.g. phone number).'
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
}
