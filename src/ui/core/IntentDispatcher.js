import { generateForm } from '../impl/form.js'
import { ContentViewer } from '../prompt/ContentViewer.js'
import { SelectModel } from '../../domain/prompt/SelectModel.js'
import { ToggleModel } from '../../domain/prompt/ToggleModel.js'
import { iconChar } from '@nan0web/icons/adapters/cli'
import { BsCheck, BsExclamationTriangle, BsX } from '@nan0web/icons/bs'

/**
 * Handles mapping OLMUI intents to CLI InputAdapter methods.
 * Extracted from CLiInputAdapter to reduce God Object complexity.
 */
export default class IntentDispatcher {
	/**
	 * @param {import('./InputAdapter.js').default & {renderForm?: Function}} adapter
	 */
	constructor(adapter) {
		this.adapter = adapter
	}

	/**
	 * Map an OLMUI Intent to the corresponding CLI interaction.
	 *
	 * @param {Object} intent
	 * @returns {Promise<{value: any, cancelled: boolean}>}
	 */
	async askIntent(intent) {
		this.#clearActiveProgress()
		const t = this.adapter.t.bind(this.adapter)

		let message = t(intent.schema?.help || intent.field)
		if (intent.schema?.suffix) message += intent.schema.suffix

		const config = {
			...intent.schema,
			message,
			initial: intent.schema?.default !== undefined ? intent.schema.default : intent.schema?.initial,
			t
		}

		// Remove 'hint' from config if it's merely a structural directive
		if (['select', 'multiselect', 'sortable', 'radio', 'autocomplete', 'tree', 'table', 'toggle', 'slider', 'mask', 'datetime'].includes(config.hint)) {
			delete config.hint
		}

		if (typeof config.validate === 'function') {
			const originalValidate = config.validate
			config.validate = async (val) => {
				const res = await originalValidate(val)
				if (typeof res === 'string') return t(res)
				return res
			}
		}

		if (Array.isArray(config.options)) {
			config.options = config.options.map(opt =>
				typeof opt === 'string' ? { label: t(opt), value: opt }
				: { ...opt, label: t(opt.label || opt.title) }
			)
		} else if (config.options instanceof Map) {
			const translated = new Map()
			for (const [val, label] of config.options.entries()) {
				translated.set(val, t(label))
			}
			config.options = translated
		}

		if (intent.model && !intent.component) {
			let SchemaClass = typeof intent.schema === 'function' ? intent.schema : null;
			if (!SchemaClass && intent.schema && typeof intent.schema === 'object') {
				// Reconstruct a pseudo-class for generateForm if it comes as a raw object from HTTP/JSON
				const className = intent.schema.__className || "RemoteSchema";
				SchemaClass = class {};
				Object.defineProperty(SchemaClass, 'name', { value: className });
				Object.assign(SchemaClass, intent.schema);
				delete SchemaClass.__className;
			}

			const form = generateForm(SchemaClass, { t: this.adapter.t.bind(this.adapter) })
			const result = await this.adapter.requestForm(form, { silent: false }) // ensure the title is printed
			if (result.cancelled) {
				return { value: undefined, cancelled: true }
			}
			return { value: result.form.state, cancelled: false }
		}

		// Auto-resolve component from schema.hint when not explicitly set
		const component = intent.component || this.#resolveComponent(intent.schema)

		switch (component) {
			case 'Select':
				return await this.adapter.requestSelect(config)
			case 'Input':
				return await this.adapter.requestInput(config)
			case 'Autocomplete':
				return await this.adapter.requestAutocomplete(config)
			case 'Confirm':
				return await this.adapter.requestConfirm(config)
			case 'SandboxWrapper': {
				if (intent.model || intent.instance) {
					// Special handling for Sandbox Component: renders standard form tuning
					const targetInstance = intent.instance || intent.model
					if (!this.adapter.renderForm) return { value: undefined, cancelled: true }
					const formController = this.adapter.renderForm(targetInstance, targetInstance.constructor)
					const result = await formController.fill()
					return { value: result.value, cancelled: result.cancelled }
				}
				return { value: undefined, cancelled: true }
			}
			case 'Tree':
				return await this.adapter.requestTree(config)
			case 'Multiselect':
				return await this.adapter.requestMultiselect(config)
			case 'Toggle':
				return await this.adapter.requestToggle(config)
			case 'Slider':
				return await this.adapter.requestSlider(config)
			case 'Mask':
				return await this.adapter.requestMask(config)
			case 'Sortable':
				return await this.adapter.requestSortable(config)
			case 'DateTime':
				return await this.adapter.requestDateTime(config)
			case 'Button':
				// Buttons in CLI are essentially "Confirm to proceed" or simple triggers
				return await this.adapter.requestConfirm({ ...config, active: t(intent.model?.content || ToggleModel.UI_YES), inactive: t(ToggleModel.UI_NO) })
			case 'ContentViewer': {
				return await ContentViewer(config).execute()
			}
			default:
				throw new Error(`Unsupported intent component mapping in CLI: ${component}`)
		}
	}

	/**
	 * Resolve CLI component name from schema metadata.
	 * Enables Model-as-Schema fields with `hint` to auto-map to the correct widget.
	 *
	 * @param {Object} [schema]
	 * @returns {string}
	 */
	#resolveComponent(schema) {
		const hint = schema?.hint
		if (hint === 'radio' || hint === 'select') return 'Select'
		if (hint === 'autocomplete-dropdown' || hint === 'autocomplete') return 'Autocomplete'
		if (hint === 'confirm') return 'Confirm'
		if (hint === 'toggle') return 'Toggle'
		if (hint === 'slider') return 'Slider'
		if (hint === 'mask') return 'Mask'
		if (hint === 'multiselect') return 'Multiselect'
		if (hint === 'sortable') return 'Sortable'
		if (hint === 'datetime') return 'DateTime'
		if (hint === 'tree') return 'Tree'
		if (hint === 'table') return 'Table'
		if (hint === 'content-viewer' || hint === 'markdown') return 'ContentViewer'
		if (schema?.options && Array.isArray(schema.options)) return 'Select'
		return 'Input'
	}

	/**
	 * Handle OLMUI Log intents.
	 * Multi-line messages are rendered via Alert box.
	 * Supports basic markdown: **bold** → ANSI bold.
	 *
	 * @param {Object} intent
	 */
	async logIntent(intent) {
		this.#hideActiveProgress()
		const t = this.adapter.t.bind(this.adapter)
		const normalizedIntent = typeof intent === 'string' ? { message: intent } : intent
		const { type, level, message, hint, component, format, ...extra } = normalizedIntent

		if (component) {
			const props = typeof message === 'object' ? { ...message, ...extra } : { content: message, ...extra }
			await this.adapter.render(component, props)
			return
		}

		let msg = typeof message === 'string' ? message : ''
		try {
			const translated = t(message)
			if (translated) msg = translated
		} catch (e) {}

		if (hint === 'markdown' || hint === 'md' || component === 'markdown' || component === 'md') {
			const { renderMarkdown } = await import('../impl/markdown.js')
			this.adapter.console.info(renderMarkdown(msg))
			return
		}

		const formatted = IntentDispatcher.#markdownToAnsi(msg)

		// Multi-line content → render as Alert box (unless pure text requested)
		if (msg.includes('\n') && format !== 'text') {
			const { alert } = await import('../impl/alert.js')
			const variant = level === 'error' ? 'error'
				: level === 'warn' ? 'warning'
					: level === 'success' ? 'success' : 'info'
			// Extract first line as title if it starts with # (markdown heading)
			let title = ''
			let body = formatted
			const lines = formatted.split('\n')
			if (lines[0].startsWith('# ')) {
				title = lines[0].slice(2).trim()
				body = lines.slice(1).join('\n').trim()
			}
			this.adapter.console.info(alert(body, variant, { title }))
		} else if (format === 'text') {
			this.adapter.console.info(formatted)
		} else {
			if (level === 'error') this.adapter.console.error(`\x1b[31m${iconChar(BsX)}\x1b[0m ${formatted}`)
			else if (level === 'warn') this.adapter.console.warn(`\x1b[33m${iconChar(BsExclamationTriangle)}\x1b[0m ${formatted}`)
			else if (level === 'success') this.adapter.console.info(`\x1b[32m${iconChar(BsCheck)}\x1b[0m ${formatted}`)
			else this.adapter.console.info(`· ${formatted}`)
		}

		if (Object.keys(extra).length > 0) {
			this.adapter.console.info(this.#toYaml(extra, 1))
		}
	}

	/**
	 * Convert basic markdown formatting to ANSI escape codes.
	 * Supports: **bold**, ![alt](url) → 🖼 alt
	 *
	 * @param {string} text
	 * @returns {string}
	 */
	static #markdownToAnsi(text) {
		if (!text) return ''
		return text
			// **bold** → ANSI bold
			.replace(/\*\*([^*]+)\*\*/g, '\x1b[1m$1\x1b[22m')
			// ![alt](url) → 🖼  alt
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '🖼  $1')
	}


	/**
	 * Convert object to YAML-like string with indentation.
	 * @param {any} obj
	 * @param {number} [indent=0]
	 * @returns {string}
	 */
	#toYaml(obj, indent = 0) {
		const t = this.adapter.t.bind(this.adapter)
		const pad = '  '.repeat(indent)
		if (obj === null) return 'null'
		if (typeof obj !== 'object') return String(obj)

		if (Array.isArray(obj)) {
			if (obj.length === 0) return '[]'
			return obj.map(val => {
				if (val && typeof val === 'object') {
					const yamlObj = this.#toYaml(val, indent + 1)
					return `${pad}- ${yamlObj.trimStart()}`
				}
				const tVal = typeof val === 'string' ? t(val) : val
				return `${pad}- ${tVal}`
			}).join('\n')
		}

		return Object.entries(obj)
			.map(([key, val]) => {
				const tKey = t(key)
				if (val && typeof val === 'object') {
					return `${pad}${tKey}:\n${this.#toYaml(val, indent + 1)}`
				}
				const tVal = typeof val === 'string' ? t(val) : val
				if (key === 'cpu') return `${pad}${tKey}: ${isNaN(Number(val)) ? 0 : val}%`
				return `${pad}${tKey}: ${tVal}`
			})
			.join('\n')
	}

	/**
	 * Handle OLMUI Result intents.
	 *
	 * @param {Object} intent
	 */
	async resultIntent(intent) {
		this.#clearActiveProgress()
		if (intent.silent) return

		const data = intent.data
		if (data === undefined) return

		if (typeof data === 'object' && data !== null) {
			if (Object.keys(data).length === 0 || (data.exit && Object.keys(data).length === 1)) {
				return
			}
		}

		// Visual separation
		this.adapter.console.info('\n' + '─'.repeat(40))
		let resTitle = data?.title || this.adapter.t(SelectModel.UI_RESULT?.default || 'Result')
		this.adapter.console.info(`🎉 ${resTitle}:`)

		if (typeof data === 'object' && data !== null) {
			this.adapter.console.info(this.#toYaml(data))
		} else {
			this.adapter.console.info(String(data))
		}

		this.adapter.console.info('─'.repeat(40) + '\n')
	}

	/** @type {NodeJS.Timeout|null} */
	#progressInterval = null
	#lastTotalLines = 0

	#startProgressManager() {
		if (this.#progressInterval) return
		this.#lastTotalLines = 0

		let fps = 25
		for (const indicator of this.adapter.activeProgresses.values()) {
			if (indicator.fps > fps) fps = indicator.fps
		}

		this.#progressInterval = setInterval(() => {
			this.#renderAllProgresses()
		}, Math.floor(1000 / fps))
	}

	#stopProgressManager() {
		if (this.#progressInterval) {
			clearInterval(this.#progressInterval)
			this.#progressInterval = null
		}
	}

	#renderAllProgresses() {
		if (!this.adapter.activeProgresses || this.adapter.activeProgresses.size === 0) {
			this.#stopProgressManager()
			return
		}

		let clearSeq = '\r'
		if (this.#lastTotalLines && this.#lastTotalLines > 1) {
			clearSeq += `\x1b[${this.#lastTotalLines - 1}A`
		}
		clearSeq += '\x1b[J'

		let allOutput = ''
		
		if (this.adapter.activeProgresses.size > 1) {
			let totalPercent = 0
			let countWithTotal = 0
			let maxRemaining = 0
			let minStartTime = Date.now()

			for (const indicator of this.adapter.activeProgresses.values()) {
				if (indicator.startTime && indicator.startTime < minStartTime) minStartTime = indicator.startTime

				if (indicator.total !== undefined && indicator.total > 0) {
					const percent = Math.min(100, Math.max(0, (indicator.current / indicator.total) * 100))
					totalPercent += percent
					countWithTotal++

					const elapsed = (Date.now() - indicator.startTime) / 1000
					const rate = elapsed > 0 ? indicator.current / elapsed : 0
					const remaining = rate > 0 ? (indicator.total - indicator.current) / rate : 0
					if (remaining > maxRemaining) maxRemaining = remaining
				}
			}

			const avgPercent = countWithTotal > 0 ? totalPercent / countWithTotal : 0
			const elapsedTotal = (Date.now() - minStartTime) / 1000

			const formatTime = (/** @type {number} */ sec) => {
				const minutes = Math.floor(sec / 60)
				const seconds = Math.floor(sec % 60)
				return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
			}

			const timeStrElapsed = formatTime(elapsedTotal)
			const etaStr = formatTime(maxRemaining)
			const timeStr = `[${timeStrElapsed} < ${etaStr}]`

			const width = 12
			const filledWidth = Math.round((width * avgPercent) / 100)
			const emptyWidth = width - filledWidth
			const innerBar = '='.repeat(filledWidth) + (filledWidth < width ? '>' : '') + '-'.repeat(Math.max(0, emptyWidth - 1))
			const barStr = `[\x1b[36m${innerBar}\x1b[0m]`

			const titleText = this.adapter.t('OVERALL PROGRESS') || 'OVERALL PROGRESS'
			const title = `\x1b[1m${titleText}\x1b[0m`
			const percentStr = `${avgPercent.toFixed(0)}%`
			const overallStr = `${timeStr} ${barStr} ${percentStr} ${title}`
			
			allOutput += overallStr + '\n'
		}

		const indicatorOutputs = []
		const maxVisible = Math.max(10, (process.stdout.rows || 24) - 5)
		let renderedCount = 0
		for (const indicator of this.adapter.activeProgresses.values()) {
			if (renderedCount >= maxVisible) break
			indicatorOutputs.push(indicator.renderToString())
			renderedCount++
		}
		if (this.adapter.activeProgresses.size > maxVisible) {
			indicatorOutputs.push(`\x1b[90m... and ${this.adapter.activeProgresses.size - maxVisible} more tasks running\x1b[0m`)
		}
		allOutput += indicatorOutputs.join('\n')

		let currentLines = 0
		const columns = process.stdout.columns || 80

		for (const part of allOutput.split('\n')) {
			const len = part.replace(/\x1b\[[0-9;]*m/g, '').length
			currentLines += Math.max(1, Math.ceil(len / columns))
		}

		process.stdout.write(clearSeq + allOutput)
		this.#lastTotalLines = currentLines
	}

	async progressIntent(intent) {
		const isAutomated = this.adapter.getRemainingAnswers().length > 0
		if (isAutomated) return

		let options = intent.options || {}
		if (typeof options === 'string') options = { id: options }
		const id = intent.id || options.id || 'default'
		const isSpinner = options.type === 'spinner' || (intent.value === undefined && intent.total === undefined && options.total === undefined)

		if (!process.stdout.isTTY) {
			// Pipeline / Non-TTY mode: skip interactive updates, log only stop events
			if (options.stop) {
				const msg = intent.message ? this.adapter.t(intent.message) || intent.message : ''
				if (msg) {
					if (options.stop === 'error') this.adapter.console.error(`✖ ${msg}`)
					else this.adapter.console.info(`✔ ${msg}`)
				}
			}
			return
		}

		if (!this.adapter.activeProgresses) {
			this.adapter.activeProgresses = new Map()
		}

		let indicator = this.adapter.activeProgresses.get(id)
		const msg = intent.message ? this.adapter.t(intent.message) || intent.message : undefined

		if (!indicator) {
			if (!isSpinner) {
				indicator = this.adapter.requestProgress({ title: msg || '', total: intent.total, ...options })
			} else {
				indicator = this.adapter.requestSpinner({ message: msg || '', ...options })
			}
			this.adapter.activeProgresses.set(id, indicator)
			this.#startProgressManager()
		}

		if (options.stop) {
			this.#stopIndicator(id, indicator, options, msg)
			this.adapter.activeProgresses.delete(id)
			if (this.adapter.activeProgresses.size === 0) {
				this.#stopProgressManager()
			}
			return
		}

		// Update
		if (indicator.update) {
			if (!isSpinner) {
				indicator.update(intent.value, { ...options, title: msg, total: intent.total || options.total })
			} else {
				indicator.update(msg, options)
			}
		}

		if (intent.stream) {
			return {
				onData: (chunk) => {
					if (!chunk) return
					const str = typeof chunk === 'string' ? chunk : chunk.toString()
					const cleanLines = str.trim().split('\n').filter(l => l.trim().length > 0)

					if (intent.stream === 'inline') {
						if (cleanLines.length > 0) {
							const newText = `${intent.message} \x1b[90m| ${cleanLines[cleanLines.length - 1].substring(0, 100)}\x1b[0m`
							if (!isSpinner) indicator.update(undefined, { title: newText })
							else indicator.update(newText)
						}
					} else {
						this.#hideActiveProgress()
						for (const line of cleanLines) {
							this.adapter.console.info(`\x1b[90m  | ${line.substring(0, 150)}\x1b[0m`)
						}
					}
				},
				onEnd: () => {
					this.#stopIndicator(id, indicator, options, msg)
				}
			}
		}

		if (options.stop || (indicator.total !== undefined && indicator.current >= indicator.total)) {
			this.#stopIndicator(id, indicator, options, msg)
		}
	}

	#stopIndicator(id, indicator, options = {}, msg) {
		if (indicator.success && options.stop === 'success') indicator.success(msg)
		else if (indicator.error && options.stop === 'error') indicator.error(msg)
		else if (indicator.success) indicator.success(msg) // mark as done
		
		const finalStr = indicator.renderToString()
		this.#hideActiveProgress()
		this.adapter.console.info(finalStr)
		
		this.adapter.activeProgresses.delete(id)
		if (this.adapter.activeProgresses.size === 0) {
			this.#stopProgressManager()
		}
	}

	#hideActiveProgress() {
		if (process.stdout.isTTY && this.adapter.activeProgresses && this.adapter.activeProgresses.size > 0) {
			let clearSeq = '\r'
			if (this.#lastTotalLines && this.#lastTotalLines > 1) {
				clearSeq += `\x1b[${this.#lastTotalLines - 1}A`
			}
			clearSeq += '\x1b[J'
			process.stdout.write(clearSeq)
			this.#lastTotalLines = 0
		}
	}

	#clearActiveProgress() {
		this.#hideActiveProgress()
		if (this.adapter.activeProgresses) {
			for (const indicator of this.adapter.activeProgresses.values()) {
				if (indicator.success) indicator.success()
				this.adapter.console.info(indicator.renderToString())
			}
			this.adapter.activeProgresses.clear()
		}
		this.#stopProgressManager()
	}
}
