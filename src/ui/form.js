/**
 * Form module – generates and processes CLI forms from model schemas.
 *
 * @module ui/form
 */

import { CancelError } from '@nan0web/ui/core'
import { createInput, Input } from './input.js'
import { select } from './select.js'
import { autocomplete } from './autocomplete.js'
import { mask } from './mask.js'
import { multiselect } from './multiselect.js'
import { datetime } from './date-time.js'
import { toggle } from './toggle.js'
import { slider } from './slider.js'
import { confirm } from './confirm.js'
import { UiForm, FormInput } from '@nan0web/ui'

/**
 * Generates a UiForm instance from a Body class static schema.
 *
 * @param {Function} BodyClass Class containing static field definitions.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.initialState={}] Initial values for the form fields.
 * @param {Function} [options.t] Optional translation function.
 * @returns {UiForm} UiForm populated with fields derived from the schema.
 */
export function generateForm(BodyClass, options = {}) {
	const { initialState = {}, t } = options
	const fields = []

	for (const [name, schema] of Object.entries(BodyClass)) {
		if (typeof schema !== 'object' || schema === null) continue

		const translate = (value) => (typeof t === 'function' ? t(value) : value)

		fields.push(
			new FormInput({
				name,
				label: translate(schema.help || name),
				type: schema.type || 'text',
				required: Boolean(schema.required),
				placeholder: translate(schema.placeholder || schema.defaultValue || ''),
				options: schema.options
					? schema.options.map((opt) =>
							typeof opt === 'string'
								? opt
								: opt.label
									? { label: opt.label, value: opt.value }
									: opt
						)
					: [],
				validation: schema.validate
					? (value) => {
							const res = schema.validate(value)
							return res === true ? true : typeof res === 'string' ? res : `Invalid ${name}`
						}
					: () => true,
			})
		)
	}

	return new UiForm({
		title: t ? t(BodyClass.name) : BodyClass.name,
		fields,
		state: { ...initialState },
	})
}

/**
 * CLI-specific form handler that introspects a model class for static field schemas.
 *
 * @class
 */
export default class Form {
	/** @type {Object} Model instance to update. */
	#model
	/** @type {Array} Configured fields derived from model schema. */
	#fields = []
	/** @type {Function} Input handler with cancellation support. */
	handler

	/**
	 * @param {Object} model - Model instance (e.g., new User({ username: argv[3] })).
	 * @param {Object} [options={}] - Options.
	 * @param {string[]} [options.stops=["quit", "cancel", "exit"]] - Stop words.
	 * @param {(prompt: string) => Promise<Input>} [options.inputFn] - Custom input function.
	 * @param {(config: any) => Promise<{index:number, value:any, cancelled?: boolean}>} [options.selectFn] - Custom select function.
	 * @param {(config: any) => Promise<any>} [options.autocompleteFn] - Custom autocomplete function.
	 * @param {(config: any) => Promise<any>} [options.maskFn] - Custom mask function.
	 * @param {(config: any) => Promise<any>} [options.multiselectFn] - Custom multiselect function.
	 * @param {(config: any) => Promise<any>} [options.datetimeFn] - Custom datetime function.
	 * @param {(config: any) => Promise<any>} [options.confirmFn] - Custom confirm function.
	 * @param {(config: any) => Promise<{value: number|undefined, cancelled: boolean}>} [options.sliderFn] - Custom slider function.
	 * @param {(config: any) => Promise<{value: boolean|undefined, cancelled: boolean}>} [options.toggleFn] - Custom toggle function.
	 * @param {Object} [options.console] - Optional console for logging.
	 * @param {Function} [options.t] - Optional translation function.
	 * @param {number} [options.maxRetries] - Max retries before infinite loop detection.
	 * @throws {TypeError} If model is not an object with a constructor.
	 */
	constructor(model, options = {}) {
		if (!model || typeof model !== 'object') {
			throw new TypeError('Form requires a model instance or UiForm')
		}
		this.options = options
		const { stops = ['quit', 'cancel', 'exit'], inputFn, selectFn, t = (k) => k } = options
		this.t = t
		this.handler = inputFn || createInput(stops)
		this.select = selectFn || select

		if (model instanceof UiForm) {
			this.#model = { ...model.state }
			this.#fields = model.fields.map((f) => {
				const required = Boolean(f.required)
				let type = f.type === 'boolean' ? 'toggle' : f.type
				if (type === 'secret') type = 'password'
				if (type === 'date') type = 'datetime'
				return {
					name: f.name,
					label: this.t(f.label || f.name),
					type,
					required,
					placeholder: this.t(String(f.placeholder || '')),
					min: f.min,
					max: f.max,
					step: f.step,
					options: f.options
						? f.options.map((opt) => {
								if (typeof opt === 'string') return { label: this.t(opt), value: opt }
								return { ...opt, label: this.t(opt.label) }
							})
						: [],
					validation: f.validation
						? (val) => {
								try {
									const res = f.validation(val)
									if (res === true || res == null) return true // Treat undefined/null as valid
									if (res === false) return `${this.t('validate.error')} ${f.name}`
									return typeof res === 'string'
										? this.t(res)
										: `${this.t('validate.error')} ${f.name}`
								} catch (error) {
									return error.message || `${this.t('validate.error')} ${f.name}`
								}
							}
						: () => true,
					schema: f,
					mask: f.mask,
				}
			})
		} else {
			if (!model.constructor) {
				throw new TypeError('Form requires a model instance with a constructor')
			}
			this.#model = model
			this.#fields = this.#generateFields()
		}
	}

	/**
	 * Generates field configurations from the model's static schema.
	 *
	 * @returns {Array<{name:string,label:string,type:string,required:boolean,placeholder:string,options:Array,validation:Function}>}
	 */
	#generateFields() {
		const Class = this.#model.constructor
		const fields = []
		for (const [name, schema] of Object.entries(Class)) {
			if (typeof schema !== 'object' || schema === null) continue
			const isRequired = schema.required === true || schema.defaultValue === undefined
			const placeholder = this.t(String(schema.placeholder || schema.defaultValue || ''))
			const options = schema.options || []

			// Support both 'validate' and 'validator' (validator takes precedence)
			const validateFn = schema.validator || schema.validate
			const validation = validateFn
				? (value) => {
						try {
							const res = validateFn(value)
							if (res === true) return true
							if (res === false) return `${this.t('validate.error')} ${name}`
							if (typeof res === 'string') return this.t(res)
							return `${this.t('validate.error')} ${name}`
						} catch (error) {
							const err = /** @type {Error} */ (error)
							return err.message || `${this.t('validate.error')} ${name}`
						}
					}
				: () => true

			const rawType = schema.type || typeof (schema.defaultValue ?? 'string')
			let type = rawType === 'boolean' ? 'toggle' : rawType

			// Normalization for common types
			if (type === 'secret') type = 'password'
			if (type === 'date') type = 'datetime'

			fields.push({
				name,
				label: this.t(schema.help || name),
				type,
				required: isRequired,
				placeholder,
				min: schema.min,
				max: schema.max,
				step: schema.step,
				mask: schema.mask,
				initial: schema.defaultValue,
				options: options.map((opt) => {
					if (typeof opt === 'string') return { label: this.t(opt), value: opt }
					return { ...opt, label: this.t(opt.label) }
				}),
				validation,
				schema,
				item: schema.item,
			})
		}
		return fields
	}

	/**
	 * Creates a {@link Form} instance directly from a Body schema.
	 *
	 * @param {typeof Object} BodyClass Class with static schema definitions.
	 * @param {Object} [initialModel={}] Optional initial model data.
	 * @param {Object} [options={}] Same options as the constructor.
	 * @returns {Form} New Form instance.
	 */
	static createFromBodySchema(BodyClass, initialModel = {}, options = {}) {
		const model = new BodyClass(initialModel)
		return new Form(model, options)
	}

	get fields() {
		return this.#fields
	}

	/**
	 * Prompts for input using the internal handler.
	 *
	 * @param {string} prompt - Input prompt.
	 * @returns {Promise<Input>} Input result.
	 */
	async input(prompt) {
		return this.handler(prompt)
	}

	/**
	 * Prompts for input, validates, and updates the model.
	 * Supports linear navigation (::prev/::next) and all advanced CLI types.
	 *
	 * @returns {Promise<{cancelled:boolean}>} Result indicating if cancelled.
	 * @throws {Error} Propagates non-cancellation errors.
	 */
	async requireInput() {
		let idx = 0
		let retries = 0
		const MAX_RETRIES = this.options.maxRetries ?? 100

		const selectFn = this.select
		const autocompleteFn = this.options.autocompleteFn || autocomplete
		const maskFn = this.options.maskFn || mask
		const multiselectFn = this.options.multiselectFn || multiselect
		const datetimeFn = this.options.datetimeFn || datetime
		const toggleFn = this.options.toggleFn || toggle
		const sliderFn = this.options.sliderFn || slider
		const confirmFn = this.options.confirmFn || confirm

		while (idx < this.#fields.length) {
			const field = this.#fields[idx]
			const currentValue = this.#model[field.name] ?? field.placeholder ?? ''

			if (retries > MAX_RETRIES) {
				throw new Error('Infinite loop detected during form input')
			}

			const label = field.label || field.name
			const hasPunctuation = label.trim().endsWith('?') || label.trim().endsWith(':')
			const promptMsg = `${label}${field.required ? ' *' : ''}${hasPunctuation ? '' : ':'}`

			try {
				let result

				if (field.type === 'select' || field.options.length > 0) {
					const selConfig = {
						title: field.label,
						message: field.label,
						prompt: `${this.t('Select')}: `,
						options: field.options,
						initial: currentValue,
						console: this.options.console,
						ask: this.handler,
						t: this.t,
					}
					result = await selectFn(selConfig)
				} else if (field.type === 'autocomplete') {
					result = await autocompleteFn({
						message: promptMsg,
						options: field.options,
						initial: currentValue,
						t: this.t,
					})
				} else if (field.type === 'multiselect') {
					result = await multiselectFn({
						message: promptMsg,
						options: field.options,
						initial: Array.isArray(currentValue) ? currentValue : [],
						t: this.t,
					})
				} else if (field.type === 'mask') {
					result = await maskFn({
						message: promptMsg,
						mask: field.mask,
						initial: currentValue,
						t: this.t,
					})
				} else if (field.type === 'datetime' || field.type === 'date') {
					result = await datetimeFn({
						message: promptMsg,
						initial: currentValue instanceof Date ? currentValue : new Date(),
						t: this.t,
					})
				} else if (field.type === 'toggle' || field.type === 'boolean') {
					result = await toggleFn({
						message: promptMsg,
						initial: currentValue === true || currentValue === 'true',
						t: this.t,
					})
				} else if (field.type === 'confirm') {
					result = await confirmFn({
						message: promptMsg,
						initial: currentValue === true || currentValue === 'true',
						t: this.t,
					})
				} else if (
					field.type === 'slider' ||
					(field.type === 'number' && field.min !== undefined)
				) {
					result = await sliderFn({
						message: promptMsg,
						min: field.min ?? 0,
						max: field.max ?? 100,
						step: field.step ?? 1,
						initial: Number(currentValue) || field.min || 0,
						t: this.t,
					})
				} else if (field.type === 'array') {
					let arr = Array.isArray(currentValue) ? [...currentValue] : []
					let done = false
					while (!done && retries <= MAX_RETRIES) {
						const options = arr.map((item, i) => {
							const lbl =
								typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
							return {
								label: `[${i}] ${lbl.length > 50 ? lbl.slice(0, 47) + '...' : lbl}`,
								value: i,
							}
						})
						options.push({ label: `+ ${this.t('Add new item')}`, value: 'add' })
						options.push({ label: `✔ ${this.t('Done')}`, value: 'done' })

						const sel = await selectFn({
							title: promptMsg,
							message: `${promptMsg} (${arr.length} items)`,
							prompt: this.t('Action: '),
							options,
							t: this.t,
							console: this.options.console,
						})

						if (sel.cancelled) {
							result = { cancelled: true }
							break
						}
						if (sel.value === 'done') {
							result = { value: arr, cancelled: false }
							done = true
						} else if (sel.value === 'add') {
							let template = ''
							if (field.item && typeof field.item === 'object') {
								template = Object.keys(field.item).reduce((acc, k) => {
									const fieldSchema = field.item[k]
									const def =
										fieldSchema.default !== undefined
											? fieldSchema.default
											: fieldSchema.defaultValue !== undefined
												? fieldSchema.defaultValue
												: ''
									return { ...acc, [k]: def }
								}, {})
							} else if (arr.length > 0 && arr[0] && typeof arr[0] === 'object') {
								template = Object.keys(arr[0]).reduce((acc, k) => ({ ...acc, [k]: '' }), {})
							}

							if (typeof template === 'object') {
								class ArrayElement {
									constructor(data) {
										Object.assign(this, data)
									}
								}
								const itemSchema = field.item || (arr.length > 0 ? arr[0] : null)
								for (const k of Object.keys(template)) {
									const fieldSchema =
										itemSchema && typeof itemSchema === 'object' && itemSchema[k]
											? itemSchema[k]
											: {}
									const valSample = arr.length > 0 && typeof arr[0] === 'object' ? arr[0][k] : null

									ArrayElement[k] = {
										...fieldSchema,
										type:
											fieldSchema.type ||
											(typeof valSample === 'boolean'
												? 'boolean'
												: typeof valSample === 'number'
													? 'number'
													: 'text'),
									}
								}
								const subForm = Form.createFromBodySchema(ArrayElement, {}, this.options)
								const subRes = await subForm.requireInput()
								if (!subRes.cancelled) arr.push({ ...subForm.body })
							} else {
								const inputObj = await this.input(`${this.t('Value')}: `)
								if (!inputObj.cancelled) {
									if (
										inputObj.value === '' &&
										arr.length === 0 &&
										(!field.item || typeof field.item !== 'object')
									) {
										if (this.options.console)
											this.options.console.error(
												this.t(
													'Error: Cannot determine the structure of a new item for an empty array without a schema.'
												)
											)
									} else {
										arr.push(
											this.convertValue(
												{ name: 'value', type: field.itemsType || 'text' },
												inputObj.value
											)
										)
									}
								}
							}
						} else {
							const idxToEdit = sel.value
							const itemToEdit = arr[idxToEdit]
							const actionSel = await selectFn({
								title: `Edit Item [${idxToEdit}]`,
								options: [
									{ label: this.t('Edit'), value: 'edit' },
									{ label: this.t('Delete'), value: 'delete' },
									{ label: this.t('Back'), value: 'cancel' },
								],
								t: this.t,
								console: this.options.console,
							})
							if (!actionSel.cancelled) {
								if (actionSel.value === 'delete') {
									arr.splice(idxToEdit, 1)
								} else if (actionSel.value === 'edit') {
									if (itemToEdit && typeof itemToEdit === 'object') {
										class ArrayElement {
											constructor(data) {
												Object.assign(this, data)
											}
										}
										const itemSchema = field.item || {}
										for (const [k, v] of Object.entries(itemToEdit)) {
											const fieldSchema =
												itemSchema && typeof itemSchema === 'object' && itemSchema[k]
													? itemSchema[k]
													: {}
											ArrayElement[k] = {
												...fieldSchema,
												type:
													fieldSchema.type ||
													(typeof v === 'boolean'
														? 'boolean'
														: typeof v === 'number'
															? 'number'
															: 'text'),
											}
										}
										const subForm = Form.createFromBodySchema(
											ArrayElement,
											itemToEdit,
											this.options
										)
										const subRes = await subForm.requireInput()
										if (!subRes.cancelled) arr[idxToEdit] = { ...subForm.body }
									} else {
										const inputObj = await this.input(
											`[${idxToEdit}] ${this.t('Value')} (${itemToEdit}): `
										)
										if (!inputObj.cancelled && inputObj.value !== '') {
											arr[idxToEdit] = this.convertValue(
												{ name: 'value', type: field.itemsType || 'text' },
												inputObj.value
											)
										}
									}
								}
							}
						}
					}
				} else {
					const inputObj = await this.input(`${promptMsg} `)
					result = { value: inputObj.value, cancelled: inputObj.cancelled }
				}

				if (result && result.cancelled) {
					return { cancelled: true }
				}

				let val = result ? result.value : currentValue
				if (typeof val === 'string') {
					const trimmed = val.trim()
					if (trimmed === '::prev' || trimmed === '::back') {
						idx = Math.max(0, idx - 1)
						retries = 0
						continue
					}
					if (trimmed === '::next' || trimmed === '::skip') {
						idx++
						retries = 0
						continue
					}
					if (trimmed === '' && field.required) {
						if (this.options.console) this.options.console.info(`\n${this.t('Field is required.')}`)
						else console.info(`\n${this.t('Field is required.')}`)
						retries++
						continue
					}
				}

				const validRes = field.validation(val)
				if (validRes !== true) {
					const errMsg = typeof validRes === 'string' ? validRes : `Invalid ${field.name}`
					if (this.options.console) this.options.console.error(`\n${errMsg}`)
					else console.error(`\n${errMsg}`)
					retries++
					continue
				}

				this.#model[field.name] = this.convertValue(field, val)
				idx++
				retries = 0
			} catch (e) {
				if (e instanceof CancelError) {
					return { cancelled: true }
				}
				throw e
			}
		}
		return { cancelled: false }
	}

	/**
	 * Converts raw input value based on field schema.
	 *
	 * @param {Object} field - Field config.
	 * @param {any} value - Input value.
	 * @returns {string|number|boolean} Typed value.
	 */
	convertValue(field, value) {
		const schema = field.schema || this.#model.constructor[field.name]
		const type = schema?.type || typeof (schema?.defaultValue ?? 'string')
		switch (type) {
			case 'number':
				return Number(value) || 0
			case 'boolean':
				return typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value)
			case 'json':
			case 'array':
			case 'object':
				try {
					return typeof value === 'string' ? JSON.parse(value) : value
				} catch (e) {
					return value
				}
			default:
				return value
		}
	}

	/** @returns {Object} The updated model instance. */
	get body() {
		return this.#model
	}
}

export { Form }
