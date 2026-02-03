/**
 * Command – defines a CLI command with options, sub‑commands and execution logic.
 *
 * @module Command
 */

import { Message } from '@nan0web/co'
import CommandMessage from './CommandMessage.js'
import CommandError from './CommandError.js'

/**
 * Represents a command definition.
 *
 * @class
 * @deprecated Use CLI instead
 */
export default class Command {
	/** @type {string} */ name = ''
	/** @type {string} */ help = ''
	/** @type {Object} */ options = {}
	/** @type {Function} */ run = async function* () {}
	/** @type {Command[]} */ children = []

	/**
	 * @param {Object} config - Command configuration.
	 * @param {string} [config.name] - Command name.
	 * @param {string} [config.help] - Help description.
	 * @param {Object} [config.options] - Options map (`{ flag: [type, default, help] }`).
	 * @param {Function} [config.run] - Async generator handling execution.
	 * @param {Command[]} [config.children] - Sub‑commands.
	 */
	constructor(config) {
		this.name = config.name || ''
		this.help = config.help || ''
		this.options = config.options || {}
		this.run = config.run || async function* () {}
		this.children = config.children || []
	}

	/**
	 * Add a sub‑command.
	 *
	 * @param {Command} command - Sub‑command instance.
	 * @returns {this}
	 */
	addSubcommand(command) {
		this.children.push(command)
		return this
	}

	/**
	 * Find a sub‑command by name.
	 *
	 * @param {string} name - Sub‑command name.
	 * @returns {Command|null}
	 */
	findSubcommand(name) {
		return this.children.find((c) => c.name === name) || null
	}

	/**
	 * Parse argv into a {@link CommandMessage}.
	 *
	 * @param {string[]|string} argv - Arguments array or string.
	 * @returns {CommandMessage}
	 */
	parse(argv) {
		const args = Array.isArray(argv) ? argv : [argv]
		const msg = new CommandMessage({ name: '', argv: [], opts: {} })
		let i = 0
		while (i < args.length) {
			const cur = args[i]
			if (cur.startsWith('--')) {
				handleLongOption(msg, args, i)
				i = updateIndexAfterOption(args, i)
			} else if (cur.startsWith('-')) {
				handleShortOption(msg, args, i)
				i = updateIndexAfterOption(args, i)
			} else {
				if (!msg.name) msg.name = cur
				else msg.argv.push(cur)
				i++
			}
		}
		if (msg.name === this.name) {
			msg.argv = [...msg.argv]
			msg.name = ''
		}
		if (msg.argv.length > 0) {
			const subName = msg.argv[0]
			const sub = this.findSubcommand(subName)
			if (sub) {
				const subMsg = sub.parse(msg.argv.slice(1))
				msg.add(subMsg)
				msg.name = subName
				msg.argv = []
			}
		}
		this._applyDefaults(msg)
		return msg
	}

	/**
	 * Generate a short help string.
	 *
	 * @returns {string}
	 */
	generateHelp() {
		const parts = []
		if (this.help) parts.push(this.help)
		const optFlags = Object.keys(this.options)
			.map((k) => `--${k}`)
			.join(' ')
		parts.push(optFlags ? `Usage: ${this.name} ${optFlags}` : `Usage: ${this.name}`)
		return parts.join('\n')
	}

	/**
	 * Execute the command's run generator.
	 *
	 * @param {Message} message - Message passed to the runner.
	 * @yields {any}
	 * @throws {CommandError}
	 */
	async *execute(message) {
		try {
			if (typeof this.run === 'function') yield* this.run(message)
		} catch (e) {
			if (e instanceof CommandError) throw e
			/** @ts-ignore */
			throw new CommandError('Command execution failed', { message: e.message, stack: e.stack })
		}
	}

	/**
	 * Apply default values from the options definition to the parsed message.
	 *
	 * @param {CommandMessage} msg
	 * @private
	 */
	_applyDefaults(msg) {
		for (const [opt, [type, def]] of Object.entries(this.options)) {
			if (!(opt in msg.opts)) {
				msg.opts[opt] = def !== undefined ? def : type === Boolean ? false : ''
			}
		}
	}
}

/* ---------- helpers ---------- */

/**
 * Process a long option (`--flag` or `--flag=value`).
 *
 * @param {CommandMessage} msg
 * @param {string[]} argv
 * @param {number} index
 * @private
 */
function handleLongOption(msg, argv, index) {
	const cur = argv[index]
	const eq = cur.indexOf('=')
	if (eq > -1) {
		const k = cur.slice(2, eq)
		const v = cur.slice(eq + 1)
		msg.opts[k] = v
	} else {
		const k = cur.slice(2)
		if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
			msg.opts[k] = argv[index + 1]
		} else {
			msg.opts[k] = true
		}
	}
}

/**
 * Process a short option (`-f` or combined `-abc`).
 *
 * @param {CommandMessage} msg
 * @param {string[]} argv
 * @param {number} index
 * @private
 */
function handleShortOption(msg, argv, index) {
	const cur = argv[index].slice(1)
	if (cur.length > 1) {
		for (const ch of cur) msg.opts[ch] = true
	} else {
		const k = cur
		if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
			msg.opts[k] = argv[index + 1]
		} else {
			msg.opts[k] = true
		}
	}
}

/**
 * Compute the next index after an option token.
 *
 * @param {string[]} argv
 * @param {number} index
 * @returns {number}
 * @private
 */
function updateIndexAfterOption(argv, index) {
	const cur = argv[index]
	if (cur.includes('=')) return index + 1
	const hasVal = index + 1 < argv.length && !argv[index + 1].startsWith('-')
	return hasVal ? index + 2 : index + 1
}
