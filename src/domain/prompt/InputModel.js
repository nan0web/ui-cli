import { Model } from '@nan0web/types'

/**
 * Model describing the Input component parameters.
 */
export class InputModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Enter value' }
	static help = 'Question or label for the input fields.'
	static initial = { alias: 'defaultValue', default: '' }
	static type = { default: 'text' }
	static validate = { alias: 'validator' }
	static format = { default: null }

	/**
	 * @param {Partial<InputModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Initial value. */ this.initial
		/** @type {string} Input type. */ this.type
		/** @type {(input?: any, answers?: any) => any} Validation function. */ this.validate
		/** @type {string|null} Format string. */ this.format
	}
}
