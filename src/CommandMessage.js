/**
 * CommandMessage – generalized CLI message representation.
 *
 * @module CommandMessage
 */

import { Message } from "@nan0web/co"
import { str2argv } from "./utils/parse.js"
import CommandError from "./CommandError.js"

/**
 * @class
 * @extends Message
 */
export default class CommandMessage extends Message {
	#name = ""
	#argv = []
	#opts = {}
	#children = []

	/**
	 * @param {Object} [input={}]
	 * @param {string} [input.name] - Command name.
	 * @param {string[]} [input.argv] - Positional arguments.
	 * @param {Object} [input.opts] - Options map.
	 * @param {Array<CommandMessage>} [input.children] - Nested messages.
	 * @param {Object} [input.body] - Message body payload.
	 */
	constructor(input = {}) {
		super(input)
		/** @type {any} */
		const data = typeof input === "object" && !Array.isArray(input) ? input : {}
		const {
			name = "",
			argv = [],
			opts = {},
			children = [],
			body = {},
		} = data

		const fullBody = { ...body, ...opts }
		this.body = fullBody

		this.#name = String(name)
		this.#argv = argv.map(String)
		this.#opts = opts
		this.#children = children.map(c => CommandMessage.from(c))

		if (typeof input === "string" || Array.isArray(input)) {
			const parsed = CommandMessage.parse(input)
			this.#name = parsed.name
			this.#argv = parsed.argv
			this.#opts = parsed.opts
			this.body = { ...this.body, ...parsed.opts }
		}
	}

	/** @returns {string} */
	get name() { return this.#name }
	/** @param {string} v */
	set name(v) { this.#name = String(v) }

	/** @returns {string[]} */
	get argv() { return this.#argv }
	/** @param {string[]} v */
	set argv(v) { this.#argv = v.map(String) }

	/** @returns {Object} */
	get opts() { return this.#opts }
	/** @param {Object} v */
	set opts(v) { this.#opts = v }

	/** @returns {Array<CommandMessage>} */
	get children() { return this.#children }

	/** @returns {Array<string>} Full command line (name + args). */
	get args() { return [this.name, ...this.argv].filter(Boolean) }

	/** @returns {string} Sub‑command name of the first child, or empty string. */
	get subCommand() { return this.children[0]?.name || "" }

	/** @returns {CommandMessage|null} First child message, or null. */
	get subCommandMessage() { return this.children[0] || null }

	/**
	 * Append a child {@link CommandMessage}.
	 *
	 * @param {CommandMessage|Object} msg
	 */
	add(msg) { this.#children.push(CommandMessage.from(msg)) }

	/**
	 * Convert the message back to a command‑line string.
	 *
	 * @returns {string}
	 */
	toString() {
		const optsStr = Object.entries(this.opts)
			.map(([k, v]) => (v === true ? `--${k}` : `--${k} ${String(v)}`))
			.join(" ")
		const argsStr = this.argv.join(" ")
		return [this.name, argsStr, optsStr].filter(Boolean).join(" ")
	}

	/**
	 * Parse raw CLI input into a {@link CommandMessage}.
	 *
	 * @param {string|string[]} argv - Input string or token array.
	 * @param {Function} [BodyClass] - Optional class to instantiate the body.
	 * @returns {CommandMessage}
	 * @throws {CommandError} If no input is supplied.
	 */
	static parse(argv, BodyClass) {
		if (typeof argv === "string") argv = str2argv(argv)
		if (argv.length === 0) throw new CommandError("No input provided")
		const result = { name: "", argv: [], opts: {} }
		let i = 0
		if (!argv[0].startsWith("-")) {
			result.name = argv[0]
			i = 1
		}
		while (i < argv.length) {
			const cur = argv[i]
			if (cur.startsWith("--")) {
				const eq = cur.indexOf("=")
				if (eq > -1) {
					const k = cur.slice(2, eq)
					const v = cur.slice(eq + 1)
					result.opts[k] = v
				} else {
					const k = cur.slice(2)
					if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
						result.opts[k] = argv[++i]
					} else {
						result.opts[k] = true
					}
				}
			} else if (cur.startsWith("-") && cur.length > 1) {
				const shorts = cur.slice(1)
				if (shorts.length > 1) {
					shorts.split("").forEach(s => (result.opts[s] = true))
				} else {
					const k = shorts
					if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
						result.opts[k] = argv[++i]
					} else {
						result.opts[k] = true
					}
				}
			} else {
				/** @ts-ignore */
				result.argv.push(cur)
			}
			i++
		}
		const msg = new CommandMessage(result)
		if (BodyClass) {
			const body = new BodyClass(result.opts)
			msg.body = body
			/** @ts-ignore */
			const errors = body.getErrors?.() || {}
			if (Object.keys(errors).length) throw new CommandError("Validation failed", { errors })
		}
		return msg
	}

	/**
	 * Convert a raw input into a {@link CommandMessage} instance.
	 *
	 * @param {CommandMessage|Message|Object|string|Array<string>} input
	 * @returns {CommandMessage}
	 */
	static from(input) {
		if (input instanceof CommandMessage) return input
		if (input instanceof Message) {
			/** @ts-ignore */
			return new CommandMessage({ body: input.body, name: input.name || "" })
		}
		return new CommandMessage(input)
	}
}