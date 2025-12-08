/**
 * CLiInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import {
	UiForm,
	InputAdapter as BaseInputAdapter,
	UiMessage,
} from "@nan0web/ui"
import { CancelError } from "@nan0web/ui/core"

import { ask as baseAsk, createInput, createPredefinedInput, Input } from "./ui/input.js"
import { select as baseSelect } from "./ui/select.js"
import { generateForm } from "./ui/form.js"

/** @typedef {import("./ui/select.js").InputFn} InputFn */
/** @typedef {import("./ui/select.js").ConsoleLike} ConsoleLike */

/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLiInputAdapter extends BaseInputAdapter {
	/** @type {string[]} Queue of predefined answers. */
	#answers = []
	/** @type {number} Current position in the answers queue. */
	#cursor = 0
	/** @type {ConsoleLike} */
	#console
	#stdout
	/** @type {Map<string, () => Promise<Function>>} */
	#components = new Map()

	constructor(options = {}) {
		super()
		const {
			predefined = process.env.PLAY_DEMO_SEQUENCE ?? [],
			divider = process.env.PLAY_DEMO_DIVIDER ?? ",",
			console: initialConsole = console,
			stdout = process.stdout,
			components = new Map(),
		} = options

		this.#console = initialConsole
		this.#stdout = stdout
		this.#components = components

		if (Array.isArray(predefined)) {
			this.#answers = predefined.map(v => String(v))
		} else if (typeof predefined === "string") {
			this.#answers = predefined
				.split(divider)
				.map(v => v.trim())
				.filter(Boolean)
		} else {
			this.#answers = []
		}
	}

	/** @returns {ConsoleLike} */
	get console() { return this.#console }
	/** @returns {NodeJS.WriteStream} */
	get stdout() { return this.#stdout }

	#nextAnswer() {
		if (this.#cursor < this.#answers.length) {
			const val = this.#answers[this.#cursor]
			this.#cursor++
			return val
		}
		return null
	}

	/**
	 * Normalise a value that can be either a raw string or an {@link Input}
	 * instance (which carries the actual value in its `value` property).
	 *
	 * @param {any} val – Raw value or {@link Input}.
	 * @returns {string} Plain string value.
	 */
	#normalise(val) {
		if (val && typeof val === "object" && "value" in val) {
			return String(val.value)
		}
		return String(val ?? "")
	}

	/**
	 * Create a handler with stop words that supports predefined answers.
	 *
	 * @param {string[]} stops - Stop words for cancellation.
	 * @returns {InputFn}
	 */
	createHandler(stops = []) {
		const self = this
		return async (question, loop = false, nextQuestion = undefined) => {
			const predefined = self.#nextAnswer()
			if (predefined !== null) {
				this.stdout.write(`${question}${predefined}\n`)
				const input = new Input({ value: predefined, stops })
				if (input.cancelled) {
					throw new CancelError("Cancelled via stop word")
				}
				return input
			}
			const interactive = createInput(stops)
			return interactive(question, loop, nextQuestion)
		}
	}

	/**
	 * Prompt the user for a full form, handling navigation and validation.
	 *
	 * @param {UiForm} form - Form definition to present.
	 * @param {Object} [options={}]
	 * @param {boolean} [options.silent=true] - Suppress console output if `true`.
	 * @returns {Promise<Object>} Result object containing form data and meta‑information.
	 */
	async requestForm(form, options = {}) {
		const { silent = true } = options
		if (!silent) this.console.info(`\n${form.title}\n`)

		let formData = { ...form.state }
		let idx = 0

		while (idx < form.fields.length) {
			const field = form.fields[idx]
			const prompt = `${field.label || field.name}${field.required ? " *" : ""}: `

			// ---- Handle select fields (options) ----------------------------------------
			if (Array.isArray(field.options ?? 0) && field.options.length) {
				const options = /** @type {any[]} */ (field.options)

				const predefined = this.#nextAnswer()
				const selConfig = {
					title: field.label,
					prompt: "Choose (number): ",
					options: options.map(opt =>
						typeof opt === "string"
							? { label: opt, value: opt }
							: opt
					),
					console: { info: this.console.info.bind(this.console) },
				}

				let selResult
				if (predefined !== null) {
					selConfig.ask = createPredefinedInput([predefined], this.console)
					selResult = await this.select(selConfig)
				} else {
					selConfig.ask = this.createHandler(["cancel", "quit", "exit"])
					selResult = await this.select(selConfig)
				}

				const chosen = selResult?.value
				if (!options.includes(chosen)) {
					this.console.error("\nEnumeration must have one value")
					continue
				}
				formData[field.name] = String(chosen)
				idx++
				continue
			}
			// ---------------------------------------------------------------------------

			const rawAnswer = await this.ask(prompt)
			const answerStr = this.#normalise(rawAnswer)

			if (["", "esc"].includes(answerStr)) {
				return {
					body: { action: "form-cancel", cancelled: true, form: {} },
					form: {},
					cancelled: true,
					action: "form-cancel",
				}
			}

			const trimmed = answerStr.trim()
			if (trimmed === "::prev" || trimmed === "::back") {
				idx = Math.max(0, idx - 1)
				continue
			}
			if (trimmed === "::next" || trimmed === "::skip") {
				idx++
				continue
			}
			if (trimmed === "" && !field.required) {
				idx++
				continue
			}
			if (field.required && trimmed === "") {
				this.console.info("\nField is required.")
				continue
			}
			const schema = field.constructor
			const { isValid, errors } = form.validateValue(field.name, trimmed, schema)
			if (!isValid) {
				this.console.warn("\n" + Object.values(errors).join("\n"))
				continue
			}
			formData[field.name] = trimmed
			idx++
		}

		const finalForm = form.setData(formData)
		const errors = finalForm.validate()
		if (errors.size) {
			this.console.warn("\n" + Object.values(errors).join("\n"))
			return await this.requestForm(form, options)
		}
		return {
			body: { action: "form-submit", cancelled: false, form: finalForm },
			form: finalForm,
			cancelled: false,
			action: "form-submit",
		}
	}

	/**
	 * Render a UI component in the CLI environment.
	 *
	 * The current CLI adapter only supports simple textual rendering.
	 *
	 * @param {string} component - Component name (e.g. `"Alert"`).
	 * @param {object} props - Props object passed to the component.
	 * @returns {Promise<void>}
	 */
	async render(component, props) {
		const compLoader = this.#components.get(component)
		if (compLoader) {
			try {
				const compFn = await compLoader()
				if (typeof compFn === "function") {
					compFn.call(this, props)
					return
				}
			} catch (/** @type {any} */ err) {
				this.console.error(`Failed to render component "${component}": ${err.message}`)
				this.console.debug?.(err.stack)
			}
		}
		if (props && typeof props === "object") {
			const { variant, content } = props
			const prefix = variant ? `[${variant}]` : ""
			this.console.info(`${prefix} ${String(content)}`)
		} else {
			this.console.info(String(component))
		}
	}

	/**
	 * Process a full form – thin wrapper around {@link requestForm}.
	 *
	 * @param {UiForm} form - Form definition.
	 * @param {object} [_state] - Unused, kept for compatibility with `CLiMessage`.
	 * @returns {Promise<Object>} Same shape as {@link requestForm} result.
	 */
	async processForm(form, _state) {
		return this.requestForm(form)
	}

	/**
	 * Prompt the user to select an option from a list.
	 *
	 * @param {Object} config - Configuration object.
	 * @returns {Promise<string>} Selected value (or empty string on cancel).
	 */
	async requestSelect(config) {
		try {
			const predefined = this.#nextAnswer()
			if (!config.console) config.console = { info: () => { } }

			if (predefined !== null) {
				config.yes = true
				config.ask = createPredefinedInput([predefined], config.console)
			}
			const result = await this.select(config)
			return result.value
		} catch (e) {
			if (e instanceof CancelError) return ""
			throw e
		}
	}

	/**
	 * Prompt for a single string input.
	 *
	 * @param {Object} config - Prompt configuration.
	 * @returns {Promise<string>} User response string.
	 */
	async requestInput(config) {
		const predefined = this.#nextAnswer()
		if (predefined !== null) return predefined

		if (config.yes === true && config.value !== undefined) {
			return config.value
		}
		const prompt = config.prompt ?? `${config.label ?? config.name}: `
		const answer = await this.ask(prompt)
		return this.#normalise(answer)
	}

	/**
	 * Asks user a question or form and returns the completed form
	 * @param {string | UiForm} question
	 * @param {object} [options={}]
	 *
	 */
	async ask(question, options = {}) {
		if (question instanceof UiForm) {
			return await this.requestForm(question, options)
		}
		const predefined = this.#nextAnswer()
		if (predefined !== null) {
			this.stdout.write(`${question}${predefined}\n`)
			return predefined
		}
		const input = await baseAsk(question)
		return input.value
	}

	/** @inheritDoc */
	async select(cfg) {
		return baseSelect(cfg)
	}

	/**
	 * **New API** – Require input for a {@link UiMessage} instance.
	 *
	 * This method mirrors the previous `UiMessage.requireInput` logic, but is now
	 * owned by the UI adapter. It validates the message according to its static
	 * {@link UiMessage.Body} schema, presents a generated {@link UiForm} and
	 * returns the updated body.  Cancellation results in a {@link CancelError}.
	 *
	 * @param {UiMessage} msg - Message instance needing input.
	 * @returns {Promise<any>} Updated message body.
	 * @throws {CancelError} When user cancels the input process.
	 */
	async requireInput(msg) {
		if (!msg) {
			throw new Error("Message instance is required")
		}
		if (!(msg instanceof UiMessage)) {
			throw new TypeError("Message must be an instance UiMessage")
		}
		/** @type {Map<string,string>} */
		let errors = msg.validate()
		while (errors.size > 0) {
			const form = generateForm(
				/** @type {any} */(msg.constructor).Body,
				{ initialState: msg.body }
			)

			const formResult = await this.processForm(form, msg.body)
			if (formResult.cancelled) {
				throw new CancelError("User cancelled form")
			}

			const updatedBody = { ...msg.body, ...formResult.form.state }
			const updatedErrors = msg.validate(updatedBody)

			if (updatedErrors.size > 0) {
				errors = updatedErrors
				continue
			}
			msg.body = updatedBody
			break
		}
		return /** @type {any} */ (msg.body)
	}
}
