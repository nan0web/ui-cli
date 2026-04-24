/**
 * CLiInputAdapter – bridges UI‑CLI utilities with generic UI core.
 *
 * @module InputAdapter
 */

import { UiForm } from '@nan0web/ui'
import { InputAdapter as BaseInputAdapter } from '@nan0web/ui/core'
import { CancelError } from '@nan0web/ui/core'
import { Form } from '../impl/form.js'
import prompts from '../impl/prompts.js'
import IntentDispatcher from './IntentDispatcher.js'
import AnswerQueue from './AnswerQueue.js'
import MessageHandler from './MessageHandler.js'

import { progress as rawProgress } from '../impl/progress.js'
import { spinner as rawSpinner } from '../impl/spinner.js'
import { ContentViewer } from '../prompt/ContentViewer.js'
import { Input } from '../prompt/Input.js'

/**
 * @typedef {Object} RequestFormOptions
 * @property {boolean} [silent=true] - Suppress console output if `true`.
 */

/** @typedef {import('@nan0web/ui/core').AskResponse} AskResponse */
/** @typedef {import('@nan0web/ui/core').Intent} Intent */
/** @typedef {import('@nan0web/ui/core').AskOptions} AskOptions */

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
// @ts-ignore TS2742: Intent.js path cannot be named, but types are fine
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
	/** @type {Map<string, any>} */
	activeProgresses = new Map()

	constructor(options = {}) {
		super()
		const {
			predefined = options.predefined ?? process.env.UI_ANSWERS ?? process.env.PLAY_DEMO_SEQUENCE ?? [],
			divider = options.divider ?? process.env.PLAY_DEMO_DIVIDER ?? ',',
			console: initialConsole = options.console || console,
			stdout = options.stdout || process.stdout,
			components = options.components || new Map(),
			t = options.t || ((key, _vars) => key),
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
		this.cancelled = false
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

	get json() {
		return this._json || false
	}
	set json(val) {
		this._json = val
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

	// Legacy test compatibility (brutal hacks support)
	get _answers() { return this.answerQueue._answers }
	set _answers(val) { this.answerQueue._answers = val }
	get _cursor() { return this.answerQueue._cursor }
	set _cursor(val) { this.answerQueue._cursor = val }

	// Support for tests using #answers as string key
	get '#answers'() { return this.answerQueue._answers }
	set '#answers'(val) { this.answerQueue._answers = val }
	get '#cursor'() { return this.answerQueue._cursor }
	set '#cursor'(val) { this.answerQueue._cursor = val }

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
	 * Execute an interactive prompt component, handling automated answers.
	 *
	 * @param {Object} component - Prompt component to execute.
	 * @returns {Promise<AskResponse>}
	 */
	async executePrompt(component) {
		const predefined = this.answerQueue.next()
		const isSnapshot = !!process.env.UI_SNAPSHOT
		
		if (predefined !== null) {
			if (predefined === '_cancel' || predefined === 'cancel' || predefined === 'exit') {
				this.cancelled = true
				return { value: undefined, cancelled: true }
			}
			
			if (!isSnapshot) {
				const model = component.model || component.props
				const t = this.t || ((k) => k)
				const title = model.UI || model.message || model.title || 'Input'
				
				// Log simulated result (masking passwords/secrets)
				const isSecret = model.type === 'password' || model.type === 'secret' || component.type === 'Password'
				const displayValue = isSecret ? '*'.repeat(String(predefined).length) : predefined
				this.console.info(`✔ ${t(title)} ${displayValue}`)
				
				// If model has a specific automated mapper, use it
				if (model.automatedInput && typeof model.automatedInput === 'function') {
					return model.automatedInput(predefined)
				}
				
				return { value: predefined, cancelled: false }
			}
		}

		if (predefined !== null && isSnapshot) {
			// In snapshot mode, we MUST run the component but inject the answer
			prompts.inject([predefined])
		}

		return await component.execute()
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
		return async (question) => {
			const res = await this.requestInput({ 
				message: typeof question === 'object' ? (question.message || '') : question, 
				stops 
			})
			return { value: res.value, cancelled: res.cancelled }
		}
	}

	createSelectHandler() {
		return async (config) => {
			return await this.requestSelect(config)
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
		await prompts({ type: 'text', name: 'pause', message: '' })
	}


	/**
	 * Prompt the user for a full form, handling navigation and validation.
	 *
	 * @param {UiForm} form - Form definition to present.
	 * @param {RequestFormOptions} [options={}]
	 * @returns {Promise<AskResponse>} Result object containing form data and meta‑information.
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
					value: undefined,
				}
			}
			throw e
		}

		if (result.cancelled) {
			return {
				body: { action: 'form-cancel', cancelled: true },
				cancelled: true,
				action: 'form-cancel',
				value: undefined,
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
			value: finalForm.state,
		}
	}

	/**
	 * Render a UI component in the CLI environment.
	 *
	 * The current CLI adapter only supports simple textual rendering.
	 *
	 * @param {string|Object} component - Component name (e.g. `"Alert"`) or render descriptor.
	 * @param {object} [props] - Props object passed to the component.
	 * @returns {Promise<void>}
	 */
	async render(component, props) {
		if (component && typeof component === 'object' && component.type === 'render') {
			props = component.props
			component = component.component
		}

		if (this.json) {
			this.console.info(JSON.stringify({ component, props }, null, 2))
			return
		}

		const { builtIns } = await import('./builtInComponents.js')

		if (builtIns[component]) {
			this.#components.set(component, builtIns[component])
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
			const contentStr = props.content || props.message || props.label || JSON.stringify(props)
			const prefix =
				props.variant || props.level ? `[${props.variant || props.level}]` : `[${component}]`
			this.console.info(`${prefix} ${String(contentStr)}`)
		} else {
			this.console.info(`[${component}]`)
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
	 * @returns {Promise<AskResponse>} Same shape as {@link requestForm} result.
	 */
	async processForm(form, _state) {
		return this.requestForm(form)
	}

	/**
	 * Prompt the user to select an option from a list.
	 *
	 * @param {Object} config - Configuration object.
	 * @returns {Promise<AskResponse>} Selected value (or null on cancel).
	 */
	async requestSelect(config) {
		const { Select } = await import('../prompt/Select.js')
		return /** @type {any} */ (await this.executePrompt(Select({ ...config, t: this.t })))
	}

	/**
	 * Prompt for a single string input.
	 *
	 * @param {Object} config - Prompt configuration.
	 * @returns {Promise<AskResponse>} User response string or null on cancel.
	 */
	async requestInput(config) {
		const { Input } = await import('../prompt/Input.js')
		return /** @type {any} */ (await this.executePrompt(Input({ ...config, t: this.t })))
	}

	async requestPassword(config) {
		const { Password } = await import('../prompt/Password.js')
		return await this.executePrompt(Password({ ...config, t: this.t }))
	}

	/**
	 * Prompt the user for an autocomplete selection.
	 *
	 * @param {Object} config - Configuration object.
	 * @returns {Promise<AskResponse>} Selected value.
	 */
	async requestAutocomplete(config) {
		const { Autocomplete } = await import('../prompt/Autocomplete.js')
		return await this.executePrompt(Autocomplete({ ...config, t: this.t }))
	}

	/**
	 * Requests confirmation (yes/no).
	 *
	 * @param {Object} config - Confirmation configuration.
	 * @returns {Promise<AskResponse>} User confirmation.
	 */
	async requestConfirm(config) {
		const { Confirm } = await import('../prompt/Confirm.js')
		return await this.executePrompt(Confirm({ ...config, t: this.t }))
	}


	/**
	 * Requests multiple selection.
	 *
	 * @param {Object} config - Multiselect configuration.
	 * @returns {Promise<AskResponse>} Selected values.
	 */
	async requestMultiselect(config) {
		const { Multiselect } = await import('../prompt/Multiselect.js')
		return /** @type {any} */ (await this.executePrompt(Multiselect({ ...config, t: this.t })))
	}

	/**
	 * Requests masked input.
	 *
	 * @param {Object} config - Mask configuration.
	 * @returns {Promise<AskResponse>} Masked value.
	 */
	async requestMask(config) {
		const { Mask } = await import('../prompt/Mask.js')
		return await this.executePrompt(Mask({ ...config, t: this.t }))
	}

	/**
	 * Request a toggle switch.
	 * @param {Object} config
	 * @returns {Promise<AskResponse>}
	 */
	async requestToggle(config) {
		const { Toggle } = await import('../prompt/Toggle.js')
		return await this.executePrompt(Toggle({ ...config, t: this.t }))
	}

	/**
	 * Request a numeric slider.
	 * @param {Object} config
	 * @returns {Promise<AskResponse>}
	 */
	async requestSlider(config) {
		const { Slider } = await import('../prompt/Slider.js')
		return await this.executePrompt(Slider({ ...config, t: this.t }))
	}

	/**
	 * Create a progress bar.
	 * @param {Object} options
	 * @returns {import('../impl/progress.js').ProgressBar}
	 */
	requestProgress(options) {
		return /** @type {any} */ (rawProgress(options))
	}

	requestSpinner(config) {
		if (typeof config === 'string') config = { message: config }
		if (config.message) config.message = this.t(config.message) || config.message
		return /** @type {any} */ (rawSpinner(config))
	}

	/**
	 * Request a selection from a tree view.
	 * @param {Object} config
	 * @returns {Promise<AskResponse>} Selected node(s).
	 */
	async requestTree(config) {
		const { Tree } = await import('../prompt/Tree.js')
		return await this.executePrompt(Tree({ ...config, t: this.t }))
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
	 * @returns {Promise<AskResponse>}
	 */
	async requestSortable(config) {
		const { Sortable } = await import('../prompt/Sortable.js')
		return await this.executePrompt(Sortable({ ...config, t: this.t }))
	}

	/**
	 * Request a date or time from the user.
	 * @param {Object} config
	 * @returns {Promise<AskResponse>}
	 */
	async requestDateTime(config) {
		const { DateTime } = await import('../prompt/DateTime.js')
		return await this.executePrompt(DateTime({ ...config, t: this.t }))
	}

	/**
	 * Asks user a question or form, or handles an OLMUI intent.
	 * @param {string | UiForm | Object} question
	 * @param {AskOptions} [options={}]
	 * @returns {Promise<AskResponse>}
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
		const { Input } = await import('../prompt/Input.js')
		return await this.executePrompt(Input({ message: question, t: this.t }))
	}

	/**
	 * Handle OLMUI Ask intents.
	 *
	 * @param {import('@nan0web/ui/core').Intent} intent
	 * @returns {Promise<AskResponse>}
	 */
	async askIntent(intent) {
		return this.dispatcher.askIntent(intent)
	}

	/**
	 * Handle OLMUI Log / Show intents.
	 *
	 * @param {import('@nan0web/ui/core').Intent} intent
	 * @returns {Promise<void>}
	 */
	async logIntent(intent) {
		return this.dispatcher.logIntent(intent)
	}

	/**
	 * Handle OLMUI Result intents.
	 *
	 * @param {import('@nan0web/ui/core').Intent} intent
	 * @returns {Promise<void>}
	 */
	async resultIntent(intent) {
		return this.dispatcher.resultIntent(intent)
	}

	/**
	 * Handle OLMUI Progress intents via Spinner/ProgressBar.
	 *
	 * @param {import('@nan0web/ui/core').Intent} intent
	 * @returns {Promise<any>}
	 */
	async progressIntent(intent) {
		return this.dispatcher.progressIntent(intent)
	}

	/** 
	 * @param {Object} cfg 
	 * @returns {Promise<{ index?: number, value: string | null }>} 
	 */
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

			return { index: idx, value: predefined ?? null }
		}

		const res = await this.requestSelect(cfg)
		return { value: res.value, index: res.index }
	}

	/**
	 * **New API** – Require input for a {@link UiMessage} instance.
	 *
	 * Validates the message according to its static Body schema, presents a
	 * generated form and returns the updated body.
	 *
	 * @param {any} msg - Message instance needing input.
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
	/**
	 * Generic request handler that dispatches to specific request methods based on type.
	 * @param {Object} config
	 * @returns {Promise<AskResponse>}
	 */
	async request(config) {
		const type = config.type || 'input'
		const methodName = `request${type.charAt(0).toUpperCase()}${type.slice(1)}`
		const handler = /** @type {any} */ (this)[methodName]
		if (typeof handler === 'function') {
			return await handler.call(this, config)
		}
		// Fallback to base request if exists or error
		return await this.requestInput(config)
	}

	/**
	 * Request a content viewer (scrollable markdown with interactive elements).
	 * @param {Object} config
	 * @returns {Promise<AskResponse>}
	 */
	async requestContentViewer(config) {
		return await this.executePrompt(ContentViewer({ ...config, t: this.t }))
	}
}
