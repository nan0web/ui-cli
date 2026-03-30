import { Model } from '@nan0web/types'

export class FormModel extends Model {
	static UI_VALIDATE_ERROR = { default: 'Validation error' }
	static UI_SELECT = { default: 'Select' }
	static UI_ADD = { default: 'Add new item' }
	static UI_DONE = { default: 'Done' }
	static UI_ACTION = { default: 'Action' }
	static UI_VALUE = { default: 'Value' }
	static UI_EDIT = { default: 'Edit' }
	static UI_DELETE = { default: 'Delete' }
	static UI_BACK = { default: 'Back' }
	static UI_REQUIRED = { default: 'Field is required' }

	/**
	 * @param {Partial<FormModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Validation error label. */ this.UI_VALIDATE_ERROR
		/** @type {string} Select label. */ this.UI_SELECT
		/** @type {string} Add label. */ this.UI_ADD
		/** @type {string} Done label. */ this.UI_DONE
		/** @type {string} Action label. */ this.UI_ACTION
		/** @type {string} Value label. */ this.UI_VALUE
		/** @type {string} Edit label. */ this.UI_EDIT
		/** @type {string} Delete label. */ this.UI_DELETE
		/** @type {string} Back label. */ this.UI_BACK
		/** @type {string} Required field label. */ this.UI_REQUIRED
	}
}
