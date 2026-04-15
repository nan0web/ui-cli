import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui'

export class ModelAsApp extends ModelAsAppUi {
	static help = {
		help: 'Show help',
		default: false,
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
		const myAlias = Class?.['alias'] || Class.name.replace(/Command|App/g, '').toLowerCase()
		const fullPath = parentPath ? `${parentPath} ${myAlias}` : myAlias

		// ── Recursive Help ─────────────────────────────────────────────────────
		// If any property is an instance of ModelAsApp and has help requested, delegate.
		for (const key in this) {
			const val = this[key]
			if (val instanceof ModelAsApp && val.help) {
				return val.generateHelp(fullPath)
			}
		}

		const t = this._?.t || ((/** @type {string} */ k) => k)
		const lines = []

		/** @type {any} */
		const UI = typeof Class.UI === 'object' && Class.UI ? Class.UI : {}

		if (UI.title) {
			lines.push(`${UI.icon ? UI.icon + ' ' : ''}${t(UI.title)}`.trim())
			if (UI.description) lines.push(`  ${t(UI.description)}`)
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
		lines.push(usageTitle)
		const posStr = posNames.length > 0 ? ` ${posNames.join(' ')}` : ''
		lines.push(`  ${fullPath}${posStr} [options]`.trimEnd())

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
							usageExamples.push(
								`${fullPath} ${cmdName} ${desc ? `— ${desc}` : ''}`.trim()
							)
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
					const left = `  ${match[1].trim()}`
					const sep = match[2]
					const right = match[3].trim()
					maxLeft = Math.max(maxLeft, left.length)
					parsedExamples.push({ left, sep, right })
				} else {
					parsedExamples.push({ left: `  ${rendered.trim()}`, sep: '', right: '' })
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
		lines.push('')

		const optionsTitle = UI.optionsTitle ? t(UI.optionsTitle) : 'Options:'
		lines.push(optionsTitle)

		let maxOptLen = 0
		let hasAlias = false
		/** @type {any[]} */
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
				left = meta.alias ? `  -${meta.alias}, --${key}` : `      --${key}`
			} else {
				left = `  --${key}`
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
			if (intent && intent.type === 'result') {
				finalData = intent.data
			}
		}
		return finalData
	}
}
