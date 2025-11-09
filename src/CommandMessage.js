/**
 * CommandMessage – message as proof of interaction
 *
 * **Philosophy**: Command message is not an intermediate result.
 * It is proof that interaction occurred.
 */
export default class CommandMessage {
	#name = ""
	#argv = []
	#opts = {}
	#children = []

	/**
	 * @typedef {Object} CommandMessageInput
	 * @property {string} [name] - Command name
	 * @property {string[]} [argv] - Command arguments
	 * @property {Object} [opts] - Command options
	 * @property {CommandMessage[]} [children] - Child messages
	 */

	/**
	 * Creates a new command message
	 *
	 * @param {CommandMessageInput} input - Input data for message
	 */
	constructor(input = {}) {
		this.name = input.name || this.#name
		this.argv = input.argv || this.#argv
		this.opts = input.opts || this.#opts
		this.children = input.children || this.#children
	}

	/**
	 * Gets command name
	 * @returns {string}
	 */
	get name() { return this.#name }

	/**
	 * Sets command name
	 * @param {string} value - New name
	 */
	set name(value) { this.#name = String(value || "") }

	/**
	 * Gets command arguments including name
	 * @returns {string[]}
	 */
	get args() { return [this.name, ...this.#argv].filter(Boolean) }

	/**
	 * Gets command arguments
	 * @returns {string[]}
	 */
	get argv() { return this.#argv }

	/**
	 * Sets command arguments
	 * @param {string[]} value - Arguments array
	 */
	set argv(value) { this.#argv = Array.isArray(value) ? value.map(String) : [] }

	/**
	 * Gets command options
	 * @returns {Object}
	 */
	get opts() { return this.#opts }

	/**
	 * Sets command options
	 * @param {Object} value - Options object
	 */
	set opts(value) { this.#opts = value || {} }

	/**
	 * Gets child messages
	 * @returns {CommandMessage[]}
	 */
	get children() { return this.#children }

	/**
	 * Sets child messages
	 * @param {CommandMessage[]} value - Child messages array
	 */
	set children(value) {
		this.#children = Array.isArray(value)
			? value.map(c => CommandMessage.from(c))
			: []
	}

	/**
	 * Gets first subcommand name
	 * @returns {string}
	 */
	get subCommand() { return this.children[0]?.name || "" }

	/**
	 * Gets first subcommand message
	 * @returns {CommandMessage|null}
	 */
	get subCommandMessage() { return this.children[0] || null }

	/**
	 * Adds a child message (implements hierarchy resonance)
	 *
	 * @param {CommandMessage} msg - Message to add
	 */
	add(msg) {
		this.#children.push(CommandMessage.from(msg))
	}

	/**
	 * Creates instance from input data
	 *
	 * @param {any} input - Input data to create message from
	 * @returns {CommandMessage}
	 */
	static from(input) {
		if (input instanceof CommandMessage) return input
		return new CommandMessage(input)
	}

	/**
	 * Parses command line arguments
	 *
	 * @param {string | string[]} argv - Arguments to parse
	 * @returns {CommandMessage}
	 */
	static parse(argv) {
		if (typeof argv === "string") {
			return CommandMessage.parse(argStringToArray(argv))
		}

		const msg = new CommandMessage({
			name: "",
			argv: [],
			opts: {}
		})

		let i = 0
		while (i < argv.length) {
			const curr = argv[i]

			if (curr.startsWith('--')) {
				handleLongOption(msg, argv, i)
				i = updateIndexAfterOption(argv, i)
			}
			else if (curr.startsWith('-')) {
				handleShortOption(msg, argv, i)
				i = updateIndexAfterOption(argv, i)
			}
			else {
				if (msg.name === "" && curr) {
					msg.name = curr
				} else if (curr) {
					msg.argv.push(curr)
				}
				i++
			}
		}

		return msg
	}

	/**
	 * Converts message to string (mirror of actual input)
	 *
	 * @returns {string}
	 */
	toString() {
		const optsStr = formatOptions(this.opts)
		const argsStr = this.argv.map(arg =>
			String(arg).includes(' ') ? `"${arg}"` : arg
		).join(' ')

		return `${this.name} ${argsStr} ${optsStr}`.trim()
	}
}

/**
 * Converts argument string to array
 *
 * @param {string} str - String to convert
 * @returns {string[]} - Argument array
 */
export function argStringToArray(str) {
	const args = []
	let current = ""
	let inQuotes = false

	for (let i = 0; i < str.length; i++) {
		const char = str[i]

		if (char === '"') {
			inQuotes = !inQuotes
			continue
		}

		if (char === ' ' && !inQuotes) {
			if (current) {
				args.push(current)
				current = ""
			}
			continue
		}

		current += char
	}

	if (current) args.push(current)
	return args
}

/**
 * Handles long option parsing (--option=value or --option value)
 *
 * @param {CommandMessage} msg - Message to update
 * @param {string[]} argv - Arguments array
 * @param {number} index - Current index
 */
export function handleLongOption(msg, argv, index) {
	const curr = argv[index]
	const eqIndex = curr.indexOf('=')

	if (eqIndex > -1) {
		const key = curr.slice(2, eqIndex)
		const value = curr.slice(eqIndex + 1)
		msg.opts[key] = value
	} else {
		const key = curr.slice(2)
		if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
			msg.opts[key] = argv[index + 1]
		} else {
			msg.opts[key] = true
		}
	}
}

/**
 * Handles short option parsing (-o value or -abc)
 *
 * @param {CommandMessage} msg - Message to update
 * @param {string[]} argv - Arguments array
 * @param {number} index - Current index
 */
export function handleShortOption(msg, argv, index) {
	const curr = argv[index].slice(1)

	if (curr.length > 1) {
		// Handle combined short options like -abc
		for (const char of curr) {
			msg.opts[char] = true
		}
	} else {
		// Handle single short option like -t
		const key = curr
		if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
			msg.opts[key] = argv[index + 1]
		} else {
			msg.opts[key] = true
		}
	}
}

/**
 * Updates index after parsing an option
 *
 * @param {string[]} argv - Arguments array
 * @param {number} index - Current index
 * @returns {number} - Updated index
 */
export function updateIndexAfterOption(argv, index) {
	const curr = argv[index]
	
	// If current argument contains '=', we consumed it in place
	if (curr.includes('=')) {
		return index + 1
	}
	
	// Check if the next argument is a value (not another option)
	const nextIsValue = index + 1 < argv.length &&
		!argv[index + 1].startsWith('-')

	// If next argument is a value, consume both current and next
	return nextIsValue ? index + 2 : index + 1
}

/**
 * Formats options object to string
 *
 * @param {Object} opts - Options to format
 * @returns {string} - Formatted options string
 */
export function formatOptions(opts) {
	return Object.entries(opts)
		.map(([key, value]) => {
			if (value === true) return `--${key}`
			if (typeof value === "string" && value.includes(' ')) {
				return `--${key}="${value}"`
			}
			return `--${key} ${value}`
		})
		.join(' ')
}