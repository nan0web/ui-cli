/**
 * CLiInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import { UiForm, InputAdapter as BaseInputAdapter, UiMessage } from '@nan0web/ui'
import { CancelError } from '@nan0web/ui/core'
import prompts from './ui/prompts.js'
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
import { generateForm, Form } from './ui/form.js'

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
			this.#answers = predefined.split(divider).map((v) => v.trim())
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
		if (process.env.UI_SNAPSHOT) return null // Use real UI (stdin) in snapshots
		if (this._disableNextAnswerLookup) return null 
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
				if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
				if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
	 * @returns {Promise<void|{value: undefined, cancelled: boolean}>}
	 */
	async pause(message) {
		const predefined = this.#nextAnswer()
		if (message) this.console.info(message)
		if (predefined !== null) {
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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

		const cliForm = new Form(form, {
			t: this.t,
			inputFn: (p) => /** @type {any} */ (this.requestInput({ message: p, prompt: p })),
			selectFn: (cfg) => this.requestSelect(cfg),
			autocompleteFn: (cfg) => this.requestAutocomplete(cfg),
			multiselectFn: (cfg) => this.requestMultiselect(cfg),
			maskFn: (cfg) => this.requestMask(cfg),
			datetimeFn: (cfg) => this.requestDateTime(cfg),
			toggleFn: (cfg) => this.requestToggle(cfg),
			sliderFn: (cfg) => this.requestSlider(cfg),
			confirmFn: (cfg) => this.requestConfirm(cfg),
			console: this.console,
			maxRetries: this.#maxRetries,
		})

		let result
		try {
			result = await cliForm.requireInput()
		} catch (/** @type {any} */ e) {
			if (e?.message?.includes('Infinite loop detected')) {
				return {
					body: { action: 'form-cancel', cancelled: true, error: 'Infinite loop detected' },
					cancelled: true,
					action: 'form-cancel',
				}
			}
			throw e
		}

		if (result.cancelled) {
			return {
				body: { action: 'form-cancel', cancelled: true },
				cancelled: true,
				action: 'form-cancel',
			}
		}

		const finalForm = form.setData(cliForm.body)
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
	 * @returns {Promise<{value: string|undefined, index: number, cancelled: boolean}>} Selected value (or undefined on cancel).
	 */
	async requestSelect(config) {
		config.limit = config.limit ?? Math.max(5, (this.stdout.rows || 24) - 4)
		try {
			const predefined = this.#nextAnswer()
			if (!config.console) config.console = this.#console

			if (predefined !== null) {
				if (predefined === '_cancel') return { value: undefined, cancelled: true, index: -1 }
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
				} else {
					// Search by label (case-insensitive)
					const match = choices.find(
						(c) =>
							String(c.label).toLowerCase().includes(predefined.toLowerCase()) ||
							String(c.value).toLowerCase() === predefined.toLowerCase()
					)
					if (match) valToInject = match.value
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
				if (predefined === '_cancel') {
					return { value: undefined, index: -1, cancelled: true }
				}
				if (predefined === '_save') {
					const saveIdx = choices.findIndex((c) => c.value === '_save')
					return { value: '_save', index: saveIdx, cancelled: false }
				}

				const matchedIdx = choices.findIndex(
					(c) =>
						String(c.label).toLowerCase().includes(predefined.toLowerCase()) ||
						String(c.value).toLowerCase() === predefined.toLowerCase()
				)
				return { value: valToInject, index: matchedIdx, cancelled: false }
			}
			config.t = this.t
			const res = await baseSelect(config)
			return { value: res.value, index: res.index, cancelled: res.cancelled ?? false }
		} catch (e) {
			if (e instanceof CancelError) return { value: undefined, index: -1, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
				initial: config.initial !== undefined ? String(config.initial) : config.placeholder,
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }

			if (process.env.UI_SNAPSHOT && config.options) {
				const frames = []
				const p = String(predefined)
				if (p.length > 1) frames.push(p.charAt(0))
				if (p.length > 2) frames.push(p.slice(0, 2))
				frames.push(p)

				for (let i = 0; i < frames.length; i++) {
					const text = frames[i]
					this.console.info(`${prompt} ${text}`)
					try {
						let results = []
						if (typeof config.options === 'function') {
							results = await config.options(text)
						} else if (Array.isArray(config.options)) {
							results = config.options.filter((el) => {
								const label = typeof el === 'string' ? el : el.title || el.label || ''
								return label.toLowerCase().includes(text.toLowerCase())
							})
						}

						const list = Array.isArray(results) ? results : []
						list.slice(0, config.limit).forEach((item) => {
							this.console.info(
								`  ${typeof item === 'string' ? item : item.title || item.label || item.value}`
							)
						})
					} catch (e) {}

					if (i < frames.length - 1) {
						this.console.info('\n[SNAPSHOT_FRAME]\n')
						await new Promise((r) => setTimeout(r, 200))
					}
				}
				return { value: predefined, cancelled: false }
			}

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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
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
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
			this.stdout.write(`${question}${predefined}\n`)
			prompts.inject([predefined])
		}
		const result = await baseAsk(question)
		return result
	}

	/**
	 * Map an OLMUI Intent to the corresponding CLI interaction.
	 *
	 * @param {Object} intent
	 * @returns {Promise<{value: any, cancelled: boolean}>}
	 */
	async askIntent(intent) {
		const config = { ...intent.schema, message: intent.schema?.help || intent.field }
		switch (intent.component) {
			case 'Select':
				return await this.requestSelect(config)
			case 'Input':
				return await this.requestInput(config)
			case 'Autocomplete':
				return await this.requestAutocomplete(config)
			case 'Confirm':
				return await this.requestConfirm(config)
			case 'SandboxWrapper': {
				if (intent.model || intent.instance) {
					// Special handling for Sandbox Component: renders standard form tuning
					const targetInstance = intent.instance || intent.model
					const formController = this.renderForm(targetInstance, targetInstance.constructor)
					const result = await formController.fill()
					return { value: result.value, cancelled: result.cancelled }
				}
				return { value: undefined, cancelled: true }
			}
			case 'Table':
				return await this.requestTable(config)
			case 'Tree':
				return await this.requestTree(config)
			case 'Multiselect':
				return await this.requestMultiselect(config)
			case 'Toggle':
				return await this.requestToggle(config)
			case 'Slider':
				return await this.requestSlider(config)
			case 'Mask':
				return await this.requestMask(config)
			case 'Sortable':
				return await this.requestSortable(config)
			case 'DateTime':
				return await this.requestDateTime(config)
			default:
				throw new Error(`Unsupported intent component mapping in CLI: ${intent.component}`)
		}
	}

	/**
	 * Handle OLMUI Log intents.
	 *
	 * @param {Object} intent
	 */
	async logIntent(intent) {
		if (intent.level === 'error') this.console.error(`🚨 ${intent.message}`)
		else if (intent.level === 'warn') this.console.warn(`⚠️ ${intent.message}`)
		else if (intent.level === 'success') this.console.info(`✅ ${intent.message}`)
		else this.console.info(`ℹ️ ${intent.message}`)
	}

	/**
	 * Handle OLMUI Progress intents via Spinner/ProgressBar.
	 *
	 * @param {Object} intent
	 */
	async progressIntent(intent) {
		const spinner = this.requestSpinner(intent.message)
		spinner.start()
		// Fake delay for demo purposes if not automated
		if (!this.#nextAnswer()) {
			await new Promise((r) => setTimeout(r, 800))
		}
		spinner.stop()
	}

	/** @inheritDoc */
	async select(cfg) {
		const predefined = this.#nextAnswer()
		if (predefined !== null) {
			if (predefined === '_cancel') return { value: null, index: -1 }
			const prompt = cfg.message || cfg.title || 'Select: '

			// Find human label
			let textValue = predefined
			if (cfg.options && Array.isArray(cfg.options)) {
				const opt = cfg.options.find(
					(o) => o === predefined || (o && typeof o === 'object' && o.value === predefined)
				)
				if (opt) {
					textValue = typeof opt === 'object' ? opt.title || opt.label : opt
				}
			}
			this.stdout.write(`✔ ${prompt} ${textValue}\n`)

			// Also need to support nested structure index mapping if called from baseSelect internally?
			// But for adapter returning `{ index, value, cancelled }` is correct.
			// Find index for human consumption or nested logic
			const idx =
				cfg.options && Array.isArray(cfg.options)
					? cfg.options.findIndex(
							(o) => o === predefined || (o && typeof o === 'object' && o.value === predefined)
						)
					: -1

			return { index: idx, value: predefined, cancelled: false }
		}

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
		if (!msg || typeof msg !== 'object') {
			throw new Error('Message instance is required')
		}
		// Use duck typing instead of instanceof to avoid monorepo duplicate module issues
		if (
			typeof msg.validate !== 'function' ||
			!msg.constructor ||
			!(/** @type {any} */ (msg.constructor).Body)
		) {
			throw new TypeError(
				'Message must be an instance of UiMessage (implementing static Body and validate())'
			)
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

	/**
	 * Render a form for the given data and schema class.
	 *
	 * @param {Object} data - Initial document data.
	 * @param {Function} SchemaClass - Schema constructor with static fields.
	 * @returns {{fill: () => Promise<any>}} Form object with fill method.
	 */
	renderForm(data, SchemaClass) {
		const form = new Form(data, {
			t: this.t,
			inputFn: (p) => /** @type {any} */ (this.requestInput({ message: p })),
			selectFn: (cfg) => this.requestSelect(cfg),
			toggleFn: (cfg) => this.requestToggle(cfg),
			sliderFn: (cfg) => this.requestSlider(cfg),
			console: this.console,
		})

		const fields = form.fields
		this.console.debug('renderForm: Fields found:', fields.map((f) => f.name).join(', '))
		if (fields.length === 0) {
			this.console.debug('renderForm: No fields found in schema', SchemaClass.name)
		}

		return {
			fill: async () => {
				let lastIndex = 0
				while (true) {
					// 1. Mock Render the Component live for visual feedback (Only if it's a Component Schema)
					const isComponent =
						data.constructor.name.endsWith('Model') && data.constructor.name !== 'SandboxModel'
					if (isComponent) {
						const componentName = data.constructor.name.replace('Model', '')
						this.console.info('\n' + '─'.repeat(40))
						this.console.info(`👀 Live Preview of <${componentName}>:`)
						this.console.info('─'.repeat(40))
						try {
							const intent = {
								type: 'ask',
								component: componentName,
								schema: { message: 'Preview' },
								model: data,
								options: data.options || ['a', 'b'],
							}
							// Provide mock options for tests or components that require them
							if (componentName === 'Autocomplete')
								intent.schema.options = ['Apple', 'Banana', 'Cherry']

							// Mock predefined input to bypass interactive prompts automatically for the preview
							const originAsk = this.ask
							this.ask = async () => ({ value: null, cancelled: true })
							
							// Setting a flag to disable pre-defined answers during preview
							this._disableNextAnswerLookup = true

							// Simulate an aborted signal so `prompts` doesn't hang
							globalThis.__IS_SANDBOX_PREVIEW__ = true
							const previewPromise = this.askIntent(intent)

							// We still want to timeout just in case it's a completely custom blocking component
							setTimeout(() => {
								if (typeof this.stop === 'function') this.stop()
							}, 100)

							try {
								await previewPromise
							} catch (e) {
								const errStr = String(e)
								const errObj = /** @type {any} */ (e)
								if (
									errStr.includes('Unsupported intent component mapping in CLI') ||
									(errObj && errObj.fields && errObj.fields.unhandled_intent) ||
									(errObj && errObj.message && errObj.message.includes('unhandled_intent'))
								) {
									if (componentName === 'Button') {
										// ANSI escape codes
										const R = '\x1b[0m'  // reset
										const B = '\x1b[1m'  // bold
										const D = '\x1b[2m'  // dim
										const U = '\x1b[4m'  // underline
										
										// Color maps matching ButtonModel variants
										const bgMap = {
											primary:   '\x1b[44m\x1b[97m',  // bgBlue, brightWhite
											secondary: '\x1b[100m\x1b[97m', // bgBrightBlack(gray), brightWhite
											info:      '\x1b[46m\x1b[30m',  // bgCyan, fgBlack
											ok:        '\x1b[42m\x1b[30m',  // bgGreen, fgBlack
											warn:      '\x1b[43m\x1b[30m',  // bgYellow, fgBlack
											err:       '\x1b[41m\x1b[97m',  // bgRed, brightWhite
											ghost:     '\x1b[2m',           // dim only (transparent)
										}
										const fgMap = {
											primary:   '\x1b[34m',  // fgBlue
											secondary: '\x1b[90m',  // fgBrightBlack(gray)
											info:      '\x1b[36m',  // fgCyan
											ok:        '\x1b[32m',  // fgGreen
											warn:      '\x1b[33m',  // fgYellow
											err:       '\x1b[31m',  // fgRed
											ghost:     '\x1b[2m',   // dim
										}
										
										const v = data.variant || 'primary'
										const sz = data.size || 'md'
										const isOutline = data.outline || false
										const isDisabled = data.disabled || false
										const isLoading = data.loading || false
										const text = data.content || data.title || data.label || 'Button'
										
										// Size-based styling
										const pad = sz === 'sm' ? '' : sz === 'lg' ? '  ' : ' '
										const sizeStyle = sz === 'lg' ? B : sz === 'sm' ? '' : ''
										
										const colorCode = isOutline ? (fgMap[v] || fgMap.primary) : (bgMap[v] || bgMap.primary)
										const innerDim = isDisabled ? D : ''
										const resetDim = isDisabled ? '\x1b[22m' : '' // reset dim logic, leave colors
										
										if (isLoading && !isDisabled) {
											this.console.info(`${colorCode}${sizeStyle}[${pad}⟲ loading...${pad}]${R}`)
										} else {
											const label = isDisabled ? `${text} ✗` : text
											this.console.info(`${colorCode}${sizeStyle}[${pad}${innerDim}${label}${resetDim}${pad}]${R}`)
										}
									} else {
										const variant = data.variant ? `${data.variant} ` : ''
										const content = data.content || data.title || data.label || componentName
										const disabled = data.disabled ? ' (disabled)' : ''
										this.console.info(`[ ${variant}${content}${disabled} ]`)
									}
								} else {
									this.console.warn(`[Preview not available yet: ${String(e)}]`)
								}
							}

							this.ask = originAsk
							this._disableNextAnswerLookup = false
							globalThis.__IS_SANDBOX_PREVIEW__ = false
						} catch (e) {
							this.console.warn(`[Preview wrapper failed: ${String(e)}]`)
						}
						this.console.info('─'.repeat(40) + '\n')
					}

					// Prepare choices: Field [Value]
					const choices = [
						...fields.map((f) => {
							const val = data[f.name] ?? ''
							let displayVal = val

							if (typeof val === 'boolean') {
								displayVal = val ? this.t('Yes') : this.t('No')
							} else if (typeof val === 'object' && val !== null) {
								displayVal = JSON.stringify(val)
							}

							if (typeof displayVal === 'string' && displayVal.length > 50) {
								displayVal = displayVal.slice(0, 47) + '...'
							}

							return {
								label: `${f.label}: [${displayVal}]`,
								value: f.name,
							}
						}),
						{ label: '──────────────────────────', value: 'sep', disabled: true },
						{ label: `✅ ${this.t('Save and exit')}`, value: '_save' },
						{ label: `❌ ${this.t('Cancel changes')}`, value: '_cancel' },
					]

					const selectedField = await this.requestSelect({
						title: `📝 ${this.t('Edit:')} ${this.t(SchemaClass.name)}`,
						message: this.t('Select field to edit:'),
						options: choices,
						limit: 15,
						initial: lastIndex,
					})

					if (selectedField.cancelled || selectedField.value === '_cancel') {
						return { value: data, cancelled: true }
					}

					if (selectedField.value === '_save') {
						return { value: data, cancelled: false }
					}

					if (typeof selectedField.index === 'number' && selectedField.index >= 0) {
						lastIndex = selectedField.index
					}
					const field = fields.find((f) => f.name === selectedField.value)
					if (!field) continue

					// Determine current value for initial
					const currentValue = data[field.name]

					let result
					if (field.options && field.options.length) {
						// Always use SelectBox if options are explicitly defined (e.g. variants, sizes)
						result = await this.requestSelect({
							message: field.label,
							options: field.options,
							initial: currentValue,
						})
					} else if (field.type === 'toggle' || field.type === 'boolean') {
						// Toggle (Yes/No) is better UX for booleans
						result = await this.requestToggle({
							message: field.label,
							initial: currentValue === true,
							active: field.active || this.t('Yes'),
							inactive: field.inactive || this.t('No'),
						})
					} else if (field.type === 'select') {
						result = await this.requestSelect({
							message: field.label,
							options: field.options,
							initial: currentValue,
						})
					} else if (field.type === 'mask') {
						result = await this.requestMask({
							message: field.label,
							mask: field.mask,
							initial: currentValue,
						})
					} else if (field.type === 'slider') {
						result = await this.requestSlider({
							message: field.label,
							min: field.min,
							max: field.max,
							step: field.step,
							initial: currentValue,
						})
					} else {
						result = await this.requestInput({
							message: field.label,
							initial:
								typeof currentValue === 'object' && currentValue !== null
									? JSON.stringify(currentValue)
									: (currentValue ?? field.placeholder),
							validate: field.validation,
						})
					}

					if (!result.cancelled && result.value !== undefined) {
						data[field.name] = form.convertValue(field, /** @type {any} */ (result.value))
					}
				}
			},
		}
	}
}
