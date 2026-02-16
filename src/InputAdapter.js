/**
 * CLiInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import { UiForm, InputAdapter as BaseInputAdapter, UiMessage } from '@nan0web/ui'
import { CancelError } from '@nan0web/ui/core'
import prompts from 'prompts'
import readline from 'node:readline'

import {
	ask as baseAsk,
	text as baseText,
	beep,
	createInput,
	createPredefinedInput,
	Input,
} from './ui/input.js'
import { next } from './ui/next.js'
import { select as baseSelect } from './ui/select.js'
import { confirm as baseConfirm } from './ui/confirm.js'
import { autocomplete as baseAutocomplete } from './ui/autocomplete.js'
import { table as baseTable } from './ui/table.js'
import { multiselect as baseMultiselect } from './ui/multiselect.js'
import { mask as baseMask } from './ui/mask.js'
import { toggle as baseToggle } from './ui/toggle.js'
import { slider as baseSlider } from './ui/slider.js'
import { progress as baseProgress } from './ui/progress.js'
import { spinner as baseSpinner } from './ui/spinner.js'
import { tree as baseTree } from './ui/tree.js'
import { datetime as baseDateTime } from './ui/date-time.js'
import { sortable as baseSortable } from './ui/sortable.js'
import { generateForm } from './ui/form.js'

const DEFAULT_MAX_RETRIES = 100

/**
 * @typedef {Object} ConsoleLike
 * @property {(...args: any[]) => void} debug
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 */

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
	/** @type {Map<string, () => Promise<any>>} */
	#components = new Map()
	/** @type {number} */
	#maxRetries
	/** @type {Function} */
	#t

	constructor(options = {}) {
		super()
		const {
			predefined = process.env.PLAY_DEMO_SEQUENCE ?? [],
			divider = process.env.PLAY_DEMO_DIVIDER ?? ',',
			console: initialConsole = console,
			stdout = process.stdout,
			components = new Map(),
			t = (key) => key,
		} = options

		let { maxRetries = process.env.UI_CLI_MAX_RETRIES ?? DEFAULT_MAX_RETRIES } = options

		// Increase default retries for automated environments to prevent flakiness
		if (process.env.PLAY_DEMO_SEQUENCE && maxRetries === DEFAULT_MAX_RETRIES) {
			maxRetries = 1000
		}

		this.#console = initialConsole
		this.#stdout = stdout
		this.#components = components
		this.#maxRetries = Number(maxRetries)
		this.#t = t

		if (Array.isArray(predefined)) {
			this.#answers = predefined.map((v) => String(v))
		} else if (typeof predefined === 'string') {
			this.#answers = predefined
				.split(divider)
				.map((v) => v.trim())
				.filter(Boolean)
		} else {
			this.#answers = []
		}
	}

	/** @returns {ConsoleLike} */
	get console() {
		return this.#console
	}
	/** @returns {Function} */
	get t() {
		return this.#t
	}
	/** @param {Function} val */
	set t(val) {
		this.#t = val
	}
	/** @returns {NodeJS.WriteStream} */
	get stdout() {
		return this.#stdout
	}

	#nextAnswer() {
		if (this.#cursor < this.#answers.length) {
			const val = this.#answers[this.#cursor]
			this.#cursor++
			return val
		}
		return null
	}

	/** @returns {string[]} */
	getRemainingAnswers() {
		return this.#answers.slice(this.#cursor)
	}

	/**
	 * Normalise a value that can be either a raw string or an {@link Input}
	 * instance (which carries the actual value in its `value` property).
	 *
	 * @param {any} val – Raw value or {@link Input}.
	 * @returns {string} Plain string value.
	 */
	#normalise(val) {
		if (val && typeof val === 'object' && 'value' in val) {
			return String(val.value)
		}
		return String(val ?? '')
	}

	/**
	 * Private helper to format value according to mask
	 * @param {string|number} value
	 * @param {string} mask
	 */
	#applyMask(value, mask) {
		if (!mask) return String(value)
		const cleanValue = String(value).replace(/[^a-zA-Z0-9]/g, '')
		let i = 0
		let v = 0
		let result = ''
		while (i < mask.length && v < cleanValue.length) {
			const maskChar = mask[i]
			if (maskChar === '#' || maskChar === '0' || maskChar === 'A') {
				result += cleanValue[v]
				v++
			} else {
				result += maskChar
			}
			i++
		}
		return result
	}

	/**
	 * Create a handler with stop words that supports predefined answers.
	 *
	 * @param {string[]} stops - Stop words for cancellation.
	 * @returns {Function}
	 */
	createHandler(stops = []) {
		const self = this
		return async (question, loop = false, nextQuestion = undefined) => {
			const predefined = self.#nextAnswer()
			if (predefined !== null) {
				this.stdout.write(`${question}${predefined}\n`)
				const input = new Input({ value: predefined, stops })
				if (input.cancelled) {
					throw new CancelError('Cancelled via stop word')
				}
				return input
			}
			const interactive = createInput(stops)
			return interactive(question, loop, nextQuestion)
		}
	}

	/**
	 * Create a select handler that supports predefined answers.
	 * @returns {Function}
	 */
	createSelectHandler() {
		const self = this
		return async (config) => {
			const predefined = self.#nextAnswer()
			if (predefined !== null) {
				// Normalize options to find value
				let choices = []
				const options = config.options || []
				if (options instanceof Map) {
					choices = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
				} else if (Array.isArray(options)) {
					choices = options.map((el) => (typeof el === 'string' ? { label: el, value: el } : el))
				}

				const idx = Number(predefined) - 1
				let valToInject = predefined
				if (!isNaN(idx) && idx >= 0 && idx < choices.length) {
					valToInject = choices[idx].value
				}

				if (config.console) {
					if (config.title) config.console.info(config.title)
					choices.forEach((c, i) => {
						config.console.info(` ${i + 1}) ${c.label}`)
					})
					const p = config.prompt ?? ''
					config.console.info(`${p}${predefined}`)
				}
				prompts.inject([valToInject])
			}
			return self.select(config)
		}
	}

	/**
	 * Pause execution and wait for user input (Press any key).
	 *
	 * @param {string} [message] - Message to display.
	 * @returns {Promise<void>}
	 */
	async pause(message) {
		const predefined = this.#nextAnswer()
		if (message) this.console.info(message)
		if (predefined !== null) {
			// Automated mode: proceed immediately
			return
		}
		// Interactive mode
		await next()
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
		if (!silent) this.console.info(`\n${this.#t(form.title)}\n`)

		let formData = { ...form.state }
		let idx = 0
		let retries = 0

		while (idx < form.fields.length) {
			const field = /** @type {any} */ (form.fields[idx])
			if (retries > this.#maxRetries) {
				return {
					body: { action: 'form-cancel', cancelled: true, error: 'Infinite loop detected' },
					cancelled: true,
					action: 'form-cancel',
				}
			}
			const label = this.#t(field.label || field.name)
			const hasPunctuation = label.trim().endsWith('?') || label.trim().endsWith(':')
			const promptMsg = `${label}${field.required ? ' *' : ''}${hasPunctuation ? '' : ':'}`

			// ---- Handle select fields (options) ----------------------------------------
			if (
				field.type === 'select' ||
				(Array.isArray(field.options ?? 0) &&
					field.options.length &&
					field.type !== 'multiselect' &&
					field.type !== 'autocomplete')
			) {
				const options = /** @type {any[]} */ (field.options)

				const selConfig = {
					title: this.#t(field.label),
					prompt: this.#t('Choose (number): '),
					options: options.map((opt) =>
						typeof opt === 'string'
							? { label: this.#t(opt), value: opt }
							: { ...opt, label: this.#t(opt.label) }
					),
					console: { info: this.console.info.bind(this.console) },
				}
				const chosen = await this.requestSelect(selConfig)
				if (!chosen || chosen.cancelled) {
					return {
						body: { action: 'form-cancel', cancelled: true },
						cancelled: true,
						action: 'form-cancel',
					}
				}

				const values = options.map((o) => (typeof o === 'string' ? o : o.value))
				if (!values.includes(chosen.value)) {
					this.console.error('\nEnumeration must have one value')
					retries++
					continue
				}
				formData[field.name] = String(chosen.value)
				idx++
				retries = 0
				continue
			}
			// ---- Handle confirm / toggle fields --------------------------------------
			if (field.type === 'confirm' || field.type === 'toggle') {
				const res = await this.requestConfirm({ message: promptMsg })
				if (!res || res.cancelled) {
					return {
						body: { action: 'form-cancel', cancelled: true },
						cancelled: true,
						action: 'form-cancel',
					}
				}
				formData[field.name] = res.value
				idx++
				continue
			}

			// ---- Handle multiselect fields -------------------------------------------
			if (field.type === 'multiselect') {
				const res = await this.requestMultiselect({
					message: promptMsg,
					options: Array.isArray(field.options) ? field.options : [],
					initial: [],
				})
				if (!res || res.cancelled) {
					return {
						body: { action: 'form-cancel', cancelled: true },
						cancelled: true,
						action: 'form-cancel',
					}
				}
				formData[field.name] = res.value
				idx++
				continue
			}

			// ---- Handle mask fields --------------------------------------------------
			if (field.type === 'mask') {
				const res = await this.requestMask({
					message: promptMsg,
					mask: field.mask || '',
					placeholder: field.placeholder || '',
				})
				if (!res || res.cancelled) {
					return {
						body: { action: 'form-cancel', cancelled: true },
						cancelled: true,
						action: 'form-cancel',
					}
				}
				formData[field.name] = res.value
				idx++
				continue
			}

			// ---- Handle date / datetime fields ---------------------------------------
			if (field.type === 'date' || field.type === 'datetime') {
				const res = await this.requestDateTime({
					message: promptMsg,
					initial: field.value instanceof Date ? field.value : new Date(),
					mask: field.mask,
				})
				if (!res || res.cancelled) {
					return {
						body: { action: 'form-cancel', cancelled: true },
						cancelled: true,
						action: 'form-cancel',
					}
				}
				formData[field.name] = res.value
				idx++
				continue
			}

			// ---- Handle text / password / number fields ------------------------------

			const res = await this.requestInput({
				prompt: promptMsg,
				initial: field.placeholder,
				type: field.type === 'password' || field.type === 'secret' ? 'password' : 'text',
				validation: (val) => {
					if (!field.validation) return true
					const result = field.validation(val)
					if (result !== true) beep()
					return result
				},
			})

			if (!res || res.cancelled) {
				return {
					body: { action: 'form-cancel', cancelled: true },
					cancelled: true,
					action: 'form-cancel',
				}
			}

			const trimmed = String(res.value || '').trim()

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
			if (trimmed === '' && !field.required) {
				idx++
				retries = 0
				continue
			}
			if (field.required && trimmed === '') {
				this.console.info(`\n${this.#t('Field is required.')}`)
				retries++
				continue
			}

			const schema = field.constructor
			const { isValid, errors } = form.validateValue(field.name, trimmed, schema)
			if (!isValid) {
				this.console.warn('\n' + Object.values(errors).join('\n'))
				retries++
				continue
			}
			formData[field.name] = trimmed
			idx++
			retries = 0
		}

		const finalForm = form.setData(formData)
		const errors = finalForm.validate()
		if (errors.size) {
			this.console.warn('\n' + Object.values(errors).join('\n'))
			return await this.requestForm(form, options)
		}
		return {
			body: { action: 'form-submit', cancelled: false, form: finalForm },
			form: finalForm,
			cancelled: false,
			action: 'form-submit',
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
				let compFn = await compLoader()
				if (compFn && typeof compFn === 'object' && compFn.default) {
					compFn = compFn.default
				}
				if (typeof compFn === 'function') {
					compFn.call(this, props)
					return
				}
			} catch (/** @type {any} */ err) {
				this.console.error(`Failed to render component "${component}": ${err.message}`)
				this.console.debug?.(err.stack)
			}
		}
		if (props && typeof props === 'object') {
			const { variant, content } = props
			const prefix = variant ? `[${variant}]` : ''
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
	 * @returns {Promise<{value: string|undefined, cancelled: boolean}>} Selected value (or undefined on cancel).
	 */
	async requestSelect(config) {
		config.limit = config.limit ?? Math.max(5, (this.stdout.rows || 24) - 4)
		try {
			const predefined = this.#nextAnswer()
			if (!config.console) config.console = this.#console

			if (predefined !== null) {
				// Normalize options to find value
				let choices = []
				const options = config.options || []
				if (options instanceof Map) {
					choices = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
				} else if (Array.isArray(options)) {
					choices = options.map((el) => {
						if (typeof el === 'string') return { label: el, value: el }
						return { label: el.label || el.title, value: el.value }
					})
				}

				const idx = Number(predefined) - 1
				let valToInject = predefined
				if (!isNaN(idx) && idx >= 0 && idx < choices.length) {
					valToInject = choices[idx].value
				}

				if (config.console) {
					if (config.title) config.console.info(config.title)
					const limit = config.limit || choices.length
					choices.slice(0, limit).forEach((c, i) => {
						config.console.info(` ${i + 1}) ${this.#t(c.label)}`)
					})
					if (choices.length > limit) {
						config.console.info(`  ↓ (${choices.length - limit} ${this.#t('more')})`)
					}
					const p = config.prompt ?? ''
					config.console.info(`✔ ${p} ${predefined}`)
				}
				return { value: valToInject, cancelled: false }
			}
			config.t = this.t
			const res = await this.select(config)
			return { value: res.value, cancelled: res.cancelled ?? false }
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Prompt for a single string input.
	 *
	 * @param {Object} config - Prompt configuration.
	 * @returns {Promise<{value: string|undefined, cancelled: boolean}>} User response string or undefined on cancel.
	 */
	async requestInput(config) {
		const predefined = this.#nextAnswer()
		const promptOrig =
			config.prompt ?? config.message ?? `${config.label ?? config.name ?? 'Input'}: `
		const prompt = this.#t(promptOrig)
		if (predefined !== null) {
			if (config.type !== 'password' && config.type !== 'secret') {
				this.console.info(`✔ ${prompt} ${predefined}`)
			} else {
				this.console.info(`✔ ${prompt} ${'*'.repeat(predefined.length)}`)
			}
			return { value: predefined, cancelled: false }
		} else if (config.yes === true && config.value !== undefined) {
			return { value: config.value, cancelled: false }
		}

		try {
			const res = await baseText({
				message: prompt,
				initial: config.initial ?? config.placeholder,
				type: config.type === 'password' || config.type === 'secret' ? 'password' : 'text',
				validate: config.validate || config.validation,
			})
			return res
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Prompt the user for an autocomplete selection.
	 *
	 * @param {Object} config - Configuration object.
	 * @returns {Promise<{value: any, cancelled: boolean}>} Selected value.
	 */
	async requestAutocomplete(config) {
		config.limit = config.limit ?? Math.max(5, (this.stdout.rows || 24) - 4)
		const predefined = this.#nextAnswer()
		const prompt = config.message || config.title || 'Search: '
		if (predefined !== null) {
			this.console.info(`${prompt} ${predefined}`)
			return { value: predefined, cancelled: false }
		}
		try {
			return await baseAutocomplete(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Requests confirmation (yes/no).
	 *
	 * @param {Object} config - Confirmation configuration.
	 * @returns {Promise<{value: boolean|undefined, cancelled: boolean}>} User confirmation.
	 */
	async requestConfirm(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Confirm: '
		if (predefined !== null) {
			const val = ['y', 'yes', 'true', '1', 'так', '+'].includes(predefined.toLowerCase())
			const display = val ? config.active || this.#t('yes') : config.inactive || this.#t('no')
			this.console.info(`✔ ${prompt} ${display}`)
			return { value: val, cancelled: false }
		}
		try {
			const active = config.active || (this.#t ? this.#t('yes') : 'Yes')
			const inactive = config.inactive || (this.#t ? this.#t('no') : 'No')
			if (typeof config === 'object' && config !== null) config.t = this.t
			return await baseConfirm({ ...config, message: prompt, active, inactive, t: this.t })
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Display an interactive table.
	 *
	 * @param {Object} config - Table configuration.
	 * @returns {Promise<{value: any, cancelled: boolean}>}
	 */
	async requestTable(config) {
		config.t = this.t
		config.prompt = (c) => this.requestInput(c)
		config.logger = config.logger || this.console
		try {
			return await baseTable(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Requests multiple selection.
	 *
	 * @param {Object} config - Multiselect configuration.
	 * @returns {Promise<{value: any[]|undefined, cancelled: boolean}>} Selected values.
	 */
	async requestMultiselect(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Select: '
		if (predefined !== null) {
			this.console.info(`${prompt} ${predefined}`)
			return { value: predefined.split(',').map((v) => v.trim()), cancelled: false }
		}
		const instructions =
			`\n${this.#t('Instructions')}:\n` +
			`    ↑/↓: ${this.#t('Highlight option')}\n` +
			`    ←/→/[space]: ${this.#t('Toggle selection')}\n` +
			`    a: ${this.#t('Toggle all')}\n` +
			`    enter/return: ${this.#t('Complete answer')}`

		// Pass instructions to multiselect config
		config.instructions = instructions
		config.t = this.t

		try {
			return await baseMultiselect(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Requests masked input.
	 *
	 * @param {Object} config - Mask configuration.
	 * @returns {Promise<{value: string|undefined, cancelled: boolean}>} Masked value.
	 */
	async requestMask(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Input: '
		if (predefined !== null) {
			const display = this.#applyMask(predefined, config.mask)
			this.console.info(`✔ ${prompt} ${display}`)
			return { value: predefined, cancelled: false }
		}
		try {
			const maskImpl = this.#components.get('mask') || baseMask
			const res = await maskImpl({ ...config, message: prompt })
			if (res && !res.cancelled) {
				try {
					readline.moveCursor(this.#stdout, 0, -1)
					readline.clearLine(this.#stdout, 0)
					this.console.info(`✔ ${prompt} ${res.value}`)
				} catch (e) {
					this.console.error('Cursor op failed:', e)
					// Ignore cursor errors in non-TTY environments, but ensure output is logged
					// If cursor moved failed, we might have duplicate log.
					// But we prioritize showing correct value.
					// If readline failed, we assume console.info needs to run?
					// If readline failed, console.info might have been cleared? No.
					// We only print if we tried to clear.
				}
			}
			return res
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Request a toggle switch.
	 * @param {Object} config
	 * @returns {Promise<{value: boolean|undefined, cancelled: boolean}>}
	 */
	async requestToggle(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Confirm: '
		if (predefined !== null) {
			this.console.info(`✔ ${prompt} ${predefined}`)
			return {
				value: ['y', 'yes', 'true', '1', 'так'].includes(predefined.toLowerCase()),
				cancelled: false,
			}
		}
		try {
			return await baseToggle(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Request a numeric slider.
	 * @param {Object} config
	 * @returns {Promise<{value: number|undefined, cancelled: boolean}>}
	 */
	async requestSlider(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Value: '
		if (predefined !== null) {
			this.console.info(`${prompt} ${predefined}`)
			return { value: Number(predefined), cancelled: false }
		}
		try {
			config.t = this.t
			return await baseSlider(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Create a progress bar.
	 * @param {Object} options
	 * @returns {import('./ui/progress.js').ProgressBar}
	 */
	requestProgress(options) {
		return baseProgress(options)
	}

	/**
	 * Create and start a spinner.
	 * @param {string} message
	 * @returns {import('./ui/spinner.js').Spinner}
	 */
	requestSpinner(message) {
		return baseSpinner(message)
	}

	/**
	 * Request a selection from a tree view.
	 * @param {Object} config
	 * @returns {Promise<{value: any, cancelled: boolean}>} Selected node(s).
	 */
	async requestTree(config) {
		const predefined = this.#nextAnswer()
		if (predefined !== null) {
			const prompt = config.message || 'Select: '
			this.console.info(`${prompt} ${predefined}`)
			return { value: predefined, cancelled: false }
		}
		try {
			config.t = this.t
			return await baseTree(config)
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Request a sortable (reorderable) list.
	 *
	 * In predefined mode the answer is treated as a comma‑separated list of
	 * values representing the desired final order.  Only items whose values
	 * appear in the answer are included; this lets you reorder a subset.
	 *
	 * @param {Object} config
	 * @param {string} config.message - Prompt / title.
	 * @param {Array<string|{label:string,value:any}>} config.items - Items to sort.
	 * @param {string} [config.hint] - Hint text.
	 * @param {Function} [config.onChange] - Callback on every reorder.
	 * @returns {Promise<{value: any[]|undefined, cancelled: boolean}>}
	 */
	async requestSortable(config) {
		const predefined = this.#nextAnswer()
		const prompt = config.message || 'Reorder: '
		if (predefined !== null) {
			// Normalise items to {label, value}
			const normalised = (config.items || []).map((el) =>
				typeof el === 'string' ? { label: el, value: el } : el
			)
			// Predefined = comma-separated values in desired order
			const order = predefined
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean)
			const ordered = []
			for (const val of order) {
				const item = normalised.find((it) => String(it.value) === val)
				if (item) ordered.push(item.value)
			}
			// Append any items not mentioned in the predefined order
			for (const item of normalised) {
				if (!ordered.includes(item.value)) ordered.push(item.value)
			}
			this.console.info(`✔ ${prompt} ${ordered.join(' → ')}`)
			return { value: ordered, cancelled: false }
		}
		try {
			return await baseSortable({ ...config, t: this.t })
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
	}

	/**
	 * Request a date or time from the user.
	 * @param {Object} config
	 * @returns {Promise<{value: Date|undefined, cancelled: boolean}>}
	 */
	async requestDateTime(config) {
		const predefined = this.#nextAnswer()
		const promptOrig = config.message || config.label || config.name || 'Date: '
		const prompt = this.#t(promptOrig)
		if (predefined !== null) {
			this.console.info(`${prompt} ${predefined}`)
			let val = new Date(predefined)
			if (isNaN(val.getTime())) {
				if (/^\d{1,2}:\d{2}/.test(predefined)) {
					const today = new Date().toISOString().split('T')[0]
					val = new Date(`${today}T${predefined}`)
				}
			}
			return { value: isNaN(val.getTime()) ? undefined : val, cancelled: false }
		}
		try {
			const res = await baseDateTime({ t: this.t, ...config, message: prompt })
			return res
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, cancelled: true }
			throw e
		}
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
			prompts.inject([predefined])
		}
		const result = await baseAsk(question)
		return result
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
			throw new Error('Message instance is required')
		}
		if (!(msg instanceof UiMessage)) {
			throw new TypeError('Message must be an instance UiMessage')
		}
		/** @type {Map<string,string>} */
		let errors = msg.validate()
		while (errors.size > 0) {
			const form = generateForm(/** @type {any} */ (msg.constructor).Body, {
				initialState: msg.body,
				t: this.#t,
			})

			const formResult = await this.processForm(form, msg.body)
			if (formResult.cancelled) {
				throw new CancelError('User cancelled form')
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
