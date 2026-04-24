import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui'
import { resolvePositionalArgs } from '../ui/core/resolvePositionalArgs.js'

export class ModelAsApp extends ModelAsAppUi {
	static help = {
		help: 'Show help',
		default: false,
	}
	/**
	 * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
	 * @param {import('@nan0web/ui').ModelAsAppOptions} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Show help */ this.help

		// ── Automated Sub-Command Instantiation ──
		const Class = /** @type {typeof ModelAsApp} */ (this.constructor)
		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (meta && typeof meta === 'object' && Array.isArray(meta.options)) {
				const val = /** @type {any} */ (this)[key]
				if (val) {
					/** @type {any} */ ;(this)[key] = this._instantiateSubCommand(key, val, data)
				}
			}
		}
	}

	/**
	 * Instantiates a subcommand if the value matches one of the options.
	 * @param {string} key - Field name.
	 * @param {any} val - Current value (string, class, or instance).
	 * @param {any} [data={}] - Data to pass to the new instance.
	 * @returns {any} Instantiated subcommand or original value.
	 */
	_instantiateSubCommand(key, val, data = {}) {
		if (val && typeof val === 'object' && typeof val.run === 'function') return val

		const Class = /** @type {typeof ModelAsApp} */ (this.constructor)
		const meta = /** @type {any} */ (Class)[key]
		if (!meta || !Array.isArray(meta.options)) return val

		let SubClass = null
		if (typeof val === 'function' && val.prototype && typeof val.prototype.run === 'function') {
			SubClass = val
		} else if (typeof val === 'string') {
			SubClass = meta.options.find((C) => {
				if (typeof C !== 'function') return false
				const alias = C.alias || C.name?.replace(/Command|App/g, '').toLowerCase()
				return alias === val
			})
		}

		if (SubClass) {
			const finalData = resolvePositionalArgs(SubClass, data._positionals || [], data)
			return new SubClass(finalData, this._)
		}

		return val
	}

	/**
	 * Generate help text for the model
	 * @example
	 * ```
	 * import { StatusCommand } from './StatusCommand.js'
	 * import { PullCommand } from './PullCommand.js'
	 * class App extends ModelAsApp {
	 * 	static alias = 'nan0cli'
	 * 	static UI = {
	 * 		title: 'App',
	 * 		description: 'App description',
	 * 		usageTitle: 'Usage:',
	 * 		usageExamples: ['App example'],
	 * 		optionsTitle: 'Options:',
	 * 	}
	 * 	static command = {
	 * 		description: 'Command description',
	 *		options: [StatusCommand, PullCommand],
	 * 		positional: true,
	 * 		required: true,
	 * 		default: StatusCommand,
	 * 	}
	 * }
	 * const app = new App()
	 * console.info(app.generateHelp())
	 * ```
	 * @param {string} [parentPath]
	 * @returns {string}
	 */
	generateHelp(parentPath = '') {
		const Class = /** @type {typeof ModelAsApp} */ (this.constructor)

		// If any property is an instance of ModelAsApp and has help requested, delegate.
		for (const key in this) {
			const val = /** @type {any} */ (this)[key]
			if (val instanceof ModelAsApp && val['help']) {
				const myAlias = Class?.['alias'] || Class.name.replace(/Command|App/g, '').toLowerCase()
				const fullPath = parentPath ? `${parentPath} ${myAlias}` : myAlias
				return val.generateHelp(fullPath)
			}
		}

		const myAlias = Class?.['alias'] || Class.name.replace(/Command|App/g, '').toLowerCase()
		const fullPath = parentPath ? `${parentPath} ${myAlias}` : myAlias

		const t = this._?.t || ((/** @type {string} */ k, p = {}) => String(k).replace(/{(\w+)}/g, (_, x) => p[x] ?? `{${x}}`).replace(/_/g, ' '))
		const lines = []

		/** @type {any} */
		const UI =
			typeof (/** @type {any} */ (Class).UI) === 'object' && /** @type {any} */ (Class).UI
				? /** @type {any} */ (Class).UI
				: {}

		if (UI.title) {
			lines.push(`# ${UI.icon ? UI.icon + ' ' : ''}${t(UI.title)}`.trim())
			if (UI.description) lines.push(`${t(UI.description)}`)
			lines.push('')
		}

		const posNames = []
		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (meta && typeof meta === 'object' && meta.help && meta.positional) {
				posNames.push(meta.required ? `<${key}>` : `[${key}]`)
			}
		}

		const usageTitle = UI.usageTitle ? t(UI.usageTitle) : 'Usage:'
		lines.push(`## ${usageTitle}`)
		lines.push('```bash')
		const posStr = posNames.length > 0 ? ` ${posNames.join(' ')}` : ''
		lines.push(`${fullPath}${posStr} [options]`.trimEnd())

		let usageExamples = UI.usageExamples
		if (!usageExamples) {
			for (const key in Class) {
				const meta = /** @type {any} */ (Class)[key]
				if (
					meta &&
					typeof meta === 'object' &&
					meta.positional &&
					(Array.isArray(meta.type) || Array.isArray(meta.options))
				) {
					usageExamples = []
					const subcommands = Array.isArray(meta.type) ? meta.type : meta.options
					for (const SubCmd of subcommands) {
						if (SubCmd && SubCmd.prototype && SubCmd.prototype.generateHelp) {
							const cmdName = SubCmd.alias || SubCmd.name.replace(/Command|App/g, '').toLowerCase()
							const desc = SubCmd.UI?.title ? t(SubCmd.UI.title) : ''
							usageExamples.push(`${fullPath} ${cmdName} ${desc ? `— ${desc}` : ''}`.trim())
						}
					}
					if (usageExamples.length === 0) usageExamples = undefined
					break
				}
			}
		}

		if (Array.isArray(usageExamples)) {
			let maxLeft = 0
			/** @type {any[]} */
			const parsedExamples = []
			for (const ex of usageExamples) {
				const renderedStr = t(ex, { cmd: fullPath })
				const match = renderedStr.match(/^(.*?)\s+(—|-)\s+(.*)$/)
				if (match) {
					const left = match[1].trim()
					const sep = match[2]
					const right = match[3].trim()
					maxLeft = Math.max(maxLeft, left.length)
					parsedExamples.push({ left, sep, right })
				} else {
					parsedExamples.push({ left: renderedStr.trim(), sep: '', right: '' })
				}
			}
			for (const p of parsedExamples) {
				if (p.right) {
					lines.push(`${p.left.padEnd(maxLeft + 3)}${p.sep} ${p.right}`)
				} else {
					lines.push(p.left)
				}
			}
		}
		lines.push('```')
		lines.push('')

		const optionsTitle = t(UI.optionsTitle || 'Options:')
		lines.push(`## ${optionsTitle}`)
		lines.push('```bash')

		let maxOptLen = 0
		let hasAlias = false
		/** @type {Array<{key: string, meta: any, left: string}>} */
		const parsedOptions = []

		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (!meta || typeof meta !== 'object' || !meta.help || key === 'UI') continue
			if (meta.alias) hasAlias = true
		}

		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (!meta || typeof meta !== 'object' || !meta.help || key === 'UI') continue

			let left
			if (hasAlias) {
				left = meta.alias ? `       -${meta.alias}, --${key}` : `           --${key}`
			} else {
				left = `       --${key}`
			}

			maxOptLen = Math.max(maxOptLen, left.length)
			parsedOptions.push({ key, meta, left })
		}

		for (const opt of parsedOptions) {
			let right = t(opt.meta.help)
			if (
				opt.key !== 'help' &&
				opt.meta.default !== undefined &&
				opt.meta.default !== null &&
				typeof opt.meta.default !== 'function' &&
				!Array.isArray(opt.meta.default)
			) {
				if (['boolean', 'string', 'number'].includes(typeof opt.meta.default)) {
					right += ` [${opt.meta.default}]`
				}
			}
			lines.push(`${opt.left.padEnd(maxOptLen + 3)}- ${right}`)
		}

		lines.push('```')
		lines.push('')
		return lines.join('\n')
	}

	/**
	 * Execute the model programmatically without a UI adapter.
	 * Instantiates the class and drains the `run()` generator, suppressing visual intents
	 * (ask, log, render) but automatically providing necessary context if available.
	 * Useful for backend scripts, docs generation (`ReadmeMd`), or API integrations.
	 * @param {any} [data]
	 * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
	 * @returns {Promise<any>}
	 */
	static async execute(data = {}, options = {}) {
		const app = new this(data, options)
		if (typeof app.run !== 'function') return null

		let finalData = null
		for await (const intent of app.run()) {
			if (intent && /** @type {any} */ (intent).type === 'result') {
				finalData = /** @type {any} */ (intent).data
			}
		}
		return finalData
	}
}
