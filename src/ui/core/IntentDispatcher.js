import { generateForm } from '../impl/form.js'
import { renderMarkdown } from '../impl/markdown.js'
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
			case 'Table':
				return await this.adapter.requestTable(config)
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
		const t = this.adapter.t.bind(this.adapter)
		const normalizedIntent = typeof intent === 'string' ? { message: intent } : intent
		const { type, level, message, hint, component, ...extra } = normalizedIntent
		
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
		
		if (hint === 'markdown') {
			this.adapter.console.info(`\n${renderMarkdown(msg)}\n`)
			return
		}

		const formatted = IntentDispatcher.#markdownToAnsi(msg)

		// Multi-line content → render as Alert box
		if (msg.includes('\n')) {
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
		const data = intent.data
		if (data === undefined) return
		
		if (typeof data === 'object' && data !== null && data.exit && Object.keys(data).length === 1) {
			return
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

	/**
	 * Handle OLMUI Progress intents via Spinner/ProgressBar.
	 *
	 * @param {Object} intent
	 */
	async progressIntent(intent) {
		const spinner = this.adapter.requestSpinner(intent.message)
		const isAutomated = this.adapter.getRemainingAnswers().length > 0

		if (intent.stream) {
			return {
				onData: (chunk) => {
					if (!chunk) return
					const str = typeof chunk === 'string' ? chunk : chunk.toString()
					const cleanLines = str.trim().split('\n').filter(l => l.trim().length > 0)
					
					if (intent.stream === 'inline') {
						if (cleanLines.length > 0) {
							spinner.message = `${intent.message} \x1b[90m| ${cleanLines[cleanLines.length - 1].substring(0, 100)}\x1b[0m`
						}
					} else {
						for (const line of cleanLines) {
							this.adapter.console.info(`\x1b[90m  | ${line.substring(0, 150)}\x1b[0m`)
						}
					}
				},
				onEnd: () => spinner.clear()
			}
		}

		if (!isAutomated) {
			await new Promise((r) => setTimeout(r, 800))
		}
		spinner.stop()
	}
}
