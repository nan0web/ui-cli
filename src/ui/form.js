/**
 * Form module – generates and processes CLI forms from model schemas.
 *
 * @module ui/form
 */

import { CancelError } from "@nan0web/ui/core"
import { createInput, Input } from "./input.js"
import { select } from "./select.js"
import { UiForm, FormInput } from "@nan0web/ui"

/**
 * Generates a UiForm instance from a Body class static schema.
 *
 * @param {Function} BodyClass Class containing static field definitions.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.initialState={}] Initial values for the form fields.
 * @param {Function} [options.t] Optional translation function.
 * @returns {UiForm} UiForm populated with fields derived from the schema.
 *
 * The function inspects static properties of `BodyClass` (e.g., `static username = { … }`)
 * and maps each to a {@link FormInput}. The generated {@link UiForm} title defaults
 * to `BodyClass.name` unless overridden via the schema.
 */
export function generateForm(BodyClass, options = {}) {
	const { initialState = {}, t } = options
	const fields = []

	for (const [name, schema] of Object.entries(BodyClass)) {
		if (typeof schema !== "object" || schema === null) continue

		const translate = (value) => (typeof t === "function" ? t(value) : value)

		fields.push(
			new FormInput({
				name,
				label: translate(schema.help || name),
				type: schema.type || "text",
				required: Boolean(schema.required),
				placeholder: translate(schema.placeholder || schema.defaultValue || ""),
				options: schema.options
					? schema.options.map((opt) =>
						typeof opt === "string"
							? opt
							: opt.label
								? { label: opt.label, value: opt.value }
								: opt,
					)
					: [],
				validation: schema.validate
					? (value) => {
						const res = schema.validate(value)
						return res === true ? true : typeof res === "string" ? res : `Invalid ${name}`
					}
					: () => true,
			}),
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
	 * @throws {TypeError} If model is not an object with a constructor.
	 */
	constructor(model, options = {}) {
		if (!model || typeof model !== "object" || !model.constructor) {
			throw new TypeError("Form requires a model instance with a constructor")
		}
		this.#model = model
		const { stops = ["quit", "cancel", "exit"], inputFn } = options
		this.handler = inputFn || createInput(stops)
		this.#fields = this.#generateFields()
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
			if (typeof schema !== "object" || schema === null) continue
			const isRequired = schema.required === true || schema.defaultValue === undefined
			const placeholder = schema.placeholder || schema.defaultValue || ""
			const options = schema.options || []
			const validation = schema.validate
				? (value) => {
					const res = schema.validate(value)
					if (res === true) return true
					if (typeof res === "string") return res
					return `Invalid ${name}`
				}
				: () => true
			fields.push({
				name,
				label: schema.help || name,
				type: schema.type || "text",
				required: isRequired,
				placeholder,
				options,
				validation,
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
	 *
	 * @example
	 *   const form = Form.createFromBodySchema(UserBody, { username: "bob" })
	 */
	static createFromBodySchema(BodyClass, initialModel = {}, options = {}) {
		const model = new BodyClass(initialModel)
		return new Form(model, options)
	}

	/**
	 * Prompts for selection using the provided configuration.
	 *
	 * @param {Object} config - Selection configuration.
	 * @returns {Promise<{index:number, value:any}>} Selected option.
	 */
	async select(config) {
		return select(config)
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
	 * Uses `ask` for text fields and `select` for option-based fields.
	 * Supports cancellation via stop words.
	 *
	 * @returns {Promise<{cancelled:boolean}>} Result indicating if cancelled.
	 * @throws {Error} Propagates non-cancellation errors.
	 */
	async requireInput() {
		let idx = 0
		while (idx < this.#fields.length) {
			const field = this.#fields[idx]
			const currentValue = this.#model[field.name] ?? field.placeholder
			const prompt = `${field.label}${field.required ? " *" : ""} [${currentValue}]: `
			try {
				if (field.options.length > 0) {
					const selConfig = {
						title: field.label,
						prompt: "Choose (number): ",
						options: field.options.map((opt) =>
							typeof opt === "string" ? opt : opt.label ? { label: opt.label, value: opt.value } : opt,
						),
						console: { info: console.info.bind(console) },
						ask: this.handler,
					}
					const selResult = await this.select(selConfig)
					const val = selResult.value
					const validRes = field.validation(val)
					if (validRes !== true) {
						console.error(`\n${validRes}`)
						continue
					}
					this.#model[field.name] = this.convertValue(field, val)
					idx++
				} else {
					const inputObj = await this.input(prompt)
					if (inputObj.cancelled) {
						return { cancelled: true }
					}
					let answer = inputObj.value.trim()
					if (answer === "" && !field.required) {
						this.#model[field.name] = ""
						idx++
						continue
					}
					const validRes = field.validation(answer)
					if (validRes !== true) {
						console.error(`\n${validRes}`)
						continue
					}
					this.#model[field.name] = this.convertValue(field, answer)
					idx++
				}
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
	 * @param {string} value - Raw string value.
	 * @returns {string|number|boolean} Typed value.
	 */
	convertValue(field, value) {
		const schema = this.#model.constructor[field.name]
		const type = schema?.type || typeof (schema?.defaultValue ?? "string")
		switch (type) {
			case "number":
				return Number(value) || 0
			case "boolean":
				return value.toLowerCase() === "true"
			default:
				return String(value)
		}
	}

	/** @returns {Object} The updated model instance. */
	get body() {
		return this.#model
	}
}
