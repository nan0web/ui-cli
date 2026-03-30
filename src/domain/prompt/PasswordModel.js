import { Model } from '@nan0web/types'

/**
 * Model describing the Password component parameters.
 */
export class PasswordModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Enter password' }
	static help = 'Secure mask for the password input field.'
	static initial = { default: '' }
	static validate = { alias: 'validator' }

	/**
	 * @param {Partial<PasswordModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Initial value. */ this.initial
		/** @type {(input?: any, answers?: any) => any} Validation function. */ this.validate
	}
}
