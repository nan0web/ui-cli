/**
 * CLiInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import { UiForm, InputAdapter as BaseInputAdapter, UiMessage } from '@nan0web/ui'
import { CancelError, MaskHandler } from '@nan0web/ui/core'
import prompts from '../impl/prompts.js'
import readline from 'node:readline'

import {
	ask as baseAsk,
	text as baseText,
	beep,
	createInput,
	createPredefinedInput,
	Input,
} from '../impl/input.js'
import { next } from '../impl/next.js'
import { select as baseSelect } from '../impl/select.js'
import { confirm as baseConfirm } from '../impl/confirm.js'
import { autocomplete as baseAutocomplete } from '../impl/autocomplete.js'
import { table as baseTable } from '../impl/table.js'
import { multiselect as baseMultiselect } from '../impl/multiselect.js'
import { mask as baseMask } from '../impl/mask.js'
import { toggle as baseToggle } from '../impl/toggle.js'
import { slider as baseSlider } from '../impl/slider.js'
import { progress as baseProgress } from '../impl/progress.js'
import { spinner as baseSpinner } from '../impl/spinner.js'
import { tree as baseTree } from '../impl/tree.js'
import { datetime as baseDateTime } from '../impl/date-time.js'
import { sortable as baseSortable } from '../impl/sortable.js'
import { generateForm, Form } from '../impl/form.js'
import IntentDispatcher from './IntentDispatcher.js'
import AnswerQueue from './AnswerQueue.js'
import PreviewRenderer from './PreviewRenderer.js'
import ObjectMapEditor from './ObjectMapEditor.js'
import MessageHandler from './MessageHandler.js'
import { SelectModel } from '../../domain/prompt/SelectModel.js'
import { MultiselectModel } from '../../domain/prompt/MultiselectModel.js'
import { ToggleModel } from '../../domain/prompt/ToggleModel.js'
import { FormModel } from '../../domain/ui/FormModel.js'

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
			t = (key, _vars) => key,
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

		this.answerQueue = new AnswerQueue({ predefined, divider })
		this.dispatcher = new IntentDispatcher(this)
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

	/**
	 * Proxy to set disabled state for testing previews
	 */
	set _disableNextAnswerLookup(val) {
		this.answerQueue.setDisabled(val)
	}

	get _disableNextAnswerLookup() {
		return this.answerQueue._disableNextAnswerLookup
	}

	/** @returns {string[]} */
	getRemainingAnswers() {
		return this.answerQueue.getRemaining()
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
			const predefined = self.answerQueue.next()
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
			const predefined = self.answerQueue.next()
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
		const predefined = this.answerQueue.next()
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
			inputFn: (cfg) => this.requestInput(cfg),
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
		const builtIns = [
			'Alert', 'Badge', 'Table', 'Breadcrumbs', 'Tabs', 'Steps', 'Toast',
			'Banner', 'Hero', 'Pricing', 'PricingSection', 'Stats', 'Timeline', 'Testimonials',
			'Accordion', 'FAQ', 'Gallery', 'EmptyState', 'Header', 'Footer',
			'Message', 'Init'
		]
		
		if (builtIns.includes(component)) {
			try {
				const uiCliExports = await import('../../index.js')
				if (uiCliExports[component]) {
					this.#components.set(component, () => Promise.resolve(uiCliExports[component]))
				}
			} catch (e) {
				// Ignore if import fails
			}
		}

		const compLoader = this.#components.get(component)
		if (compLoader) {
			try {
				let compFn = await compLoader()
				if (compFn && typeof compFn === 'object' && compFn.default) {
					compFn = compFn.default
				}
				if (typeof compFn === 'function') {
					const out = compFn.call(this, props)
					this.console.info(String(out))
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

	// ─── OLMUI Intent Handlers ───

	/** @param {Object} intent */
	async log(intent) {
		return await this.dispatcher.logIntent(intent)
	}

	/** @param {Object} intent */
	async progress(intent) {
		return await this.dispatcher.progressIntent(intent)
	}

	/** @param {Object} intent */
	async result(intent) {
		return await this.dispatcher.resultIntent(intent)
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
			const predefined = this.answerQueue.next()
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
						config.console.info(`  ↓ (${choices.length - limit} ${this.#t(SelectModel.UI_MORE)})`)
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
			if (config.title) config.title = this.t(config.title)
			if (config.message) config.message = this.t(config.message)
			if (config.prompt) config.prompt = this.t(config.prompt)
			if (config.label) config.label = this.t(config.label)
			if (Array.isArray(config.options)) {
				config.options = config.options.map((el) => {
					if (typeof el === 'string') return { label: this.t(el), value: el }
					return { ...el, label: this.t(el.label || el.title || el.name) }
				})
			}
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
		const predefined = this.answerQueue.next()
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
		const predefined = this.answerQueue.next()
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
		const predefined = this.answerQueue.next()
		const prompt = config.message || 'Confirm: '
		if (predefined !== null) {
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
			const val = ['y', 'yes', 'true', '1', 'так', '+'].includes(predefined.toLowerCase())
			const display = val ? config.active || this.#t(ToggleModel.UI_YES) : config.inactive || this.#t(ToggleModel.UI_NO)
			this.console.info(`✔ ${prompt} ${display}`)
			return { value: val, cancelled: false }
		}
		try {
			const active = config.active || (this.#t ? this.#t(ToggleModel.UI_YES) : 'Yes')
			const inactive = config.inactive || (this.#t ? this.#t(ToggleModel.UI_NO) : 'No')
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
		const predefined = this.answerQueue.next()
		const prompt = config.message || 'Select: '
		if (predefined !== null) {
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
			this.console.info(`${prompt} ${predefined}`)
			return { value: predefined.split(',').map((v) => v.trim()), cancelled: false }
		}
		const instructions =
			`\n${this.#t(MultiselectModel.UI_HELP)}:\n` +
			`    ↑/↓: ${this.#t(MultiselectModel.UI_HIGHLIGHT)}\n` +
			`    ←/→/[space]: ${this.#t(MultiselectModel.UI_TOGGLE)}\n` +
			`    a: ${this.#t(MultiselectModel.UI_TOGGLE_ALL)}\n` +
			`    enter/return: ${this.#t(MultiselectModel.UI_COMPLETE)}`

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
		const predefined = this.answerQueue.next()
		const prompt = config.message || 'Input: '
		if (predefined !== null) {
			if (predefined === '_cancel') return { value: undefined, cancelled: true }
			// Use MaskHandler to format the predefined value correctly
			const mh = new MaskHandler(config.mask)
			mh.setValue(predefined)
			const display = mh.formatted
			this.console.info(`✔ ${prompt} ${display}`)
			return { value: display, cancelled: false }
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
		const predefined = this.answerQueue.next()
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
		const predefined = this.answerQueue.next()
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
	 * @returns {import('../impl/progress.js').ProgressBar}
	 */
	requestProgress(options) {
		return baseProgress(options)
	}

	requestSpinner(message) {
		return baseSpinner(this.t(message))
	}

	/**
	 * Request a selection from a tree view.
	 * @param {Object} config
	 * @returns {Promise<{value: any, cancelled: boolean}>} Selected node(s).
	 */
	async requestTree(config) {
		const predefined = this.answerQueue.next()
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
		const predefined = this.answerQueue.next()
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
		const predefined = this.answerQueue.next()
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
	 * Asks user a question or form, or handles an OLMUI intent.
	 * @param {string | UiForm | Object} question
	 * @param {object} [options={}]
	 *
	 */
	async ask(question, options = {}) {
		if (question && typeof question === 'object') {
			if (question instanceof UiForm) {
				return await this.requestForm(question, options)
			}
			if (question.type === 'ask') {
				return await this.dispatcher.askIntent(question)
			}
		}
		const predefined = this.answerQueue.next()
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
		return this.dispatcher.askIntent(intent)
	}

	/**
	 * Handle OLMUI Log intents.
	 *
	 * @param {Object} intent
	 */
	async logIntent(intent) {
		return this.dispatcher.logIntent(intent)
	}

	/**
	 * Handle OLMUI Result intents.
	 *
	 * @param {Object} intent
	 */
	async resultIntent(intent) {
		return this.dispatcher.resultIntent(intent)
	}

	/**
	 * Handle OLMUI Progress intents via Spinner/ProgressBar.
	 *
	 * @param {Object} intent
	 */
	async progressIntent(intent) {
		return this.dispatcher.progressIntent(intent)
	}

	/** @inheritDoc */
	async select(cfg) {
		const predefined = this.answerQueue.next()
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
	 * Validates the message according to its static Body schema, presents a
	 * generated form and returns the updated body.
	 *
	 * @param {UiMessage} msg - Message instance needing input.
	 * @returns {Promise<any>} Updated message body.
	 * @throws {CancelError} When user cancels the input process.
	 */
	async requireInput(msg) {
		return MessageHandler.requireInput(this, msg)
	}

	/**
	 * Render a form for the given data and schema class.
	 *
	 * @param {Object} data - Initial document data.
	 * @param {Function} SchemaClass - Schema constructor with static fields.
	 * @returns {{fill: () => Promise<any>}} Form object with fill method.
	 */
	renderForm(data, SchemaClass) {
		return ObjectMapEditor.create(this, data, SchemaClass)
	}
}
