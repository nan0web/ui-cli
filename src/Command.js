import CommandMessage from "./CommandMessage.js"
import CommandError from "./CommandError.js"

/**
 * Command – an act of proven will
 *
 * **Philosophy**: Command is not a tool.
 * Command is proof that your intention can be fulfilled.
 */
export default class Command {
	/**
	 * @typedef {Object} CommandConfig
	 * @property {string} name - Command name
	 * @property {string} [help=""] - Help text
	 * @property {Object} [options={}] - Command options
	 * @property {Function} [run] - Execution function
	 * @property {Command[]} [children=[]] - Child commands
	 */

	/**
	 * Creates a new command
	 *
	 * @param {CommandConfig} config - Command configuration
	 */
	constructor(config) {
		this.name = config.name || ""
		this.help = config.help || ""
		this.options = config.options || {}
		this.run = config.run || (() => { })
		this.children = config.children || []
	}

	/**
	 * Adds a subcommand
	 *
	 * @param {Command} command - Command to add
	 * @returns {Command} - This instance for chaining
	 */
	addSubcommand(command) {
		this.children.push(command)
		return this
	}

	/**
	 * Finds a subcommand by name
	 *
	 * @param {string} name - Name of command to find
	 * @returns {Command|null}
	 */
	findSubcommand(name) {
		return this.children.find(c => c.name === name) || null
	}

	/**
	 * Parses command line arguments
	 *
	 * @param {string | string[]} argv - Arguments to parse
	 * @returns {CommandMessage} - Validated message
	 */
	parse(argv) {
		const msg = new CommandMessage({
			name: "",
			argv: Array.isArray(argv) ? [...argv] : [argv],
			opts: {}
		})

		let i = 0
		const args = Array.isArray(argv) ? argv : [argv]
		
		while (i < args.length) {
			const curr = args[i]

			if (curr.startsWith('--')) {
				handleLongOption(msg, args, i)
				i = updateIndexAfterOption(args, i)
			}
			else if (curr.startsWith('-')) {
				handleShortOption(msg, args, i)
				i = updateIndexAfterOption(args, i)
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

		// Handle subcommands
		if (msg.argv.length > 0 && msg.argv[0]) {
			const subcommand = this.findSubcommand(msg.argv[0])
			if (subcommand) {
				const subMsg = subcommand.parse(msg.argv.slice(1))
				subMsg.name = msg.argv[0]
				msg.add(subMsg)
				// Update argv to exclude processed subcommand
				msg.argv = msg.argv.slice(1)
			}
		}

		// Apply defaults
		this._applyDefaults(msg)

		return msg
	}

	/**
	 * Generates help text for command
	 *
	 * @returns {string} - Help text
	 */
	generateHelp() {
		const rows = []

		// Usage
		let usage = `Usage: ${this.name}`

		// Options
		const options = Object.entries(this.options)
		if (options.length > 0) usage += " [options]"

		// Arguments
		this.children.forEach(child => {
			usage += ` [${child.name}]`
		})

		rows.push(usage)
		rows.push("")

		// Description
		if (this.help) rows.push(this.help + "\n")

		// Options list
		if (options.length > 0) {
			rows.push("Options:")
			options.forEach(([name, [type, def, desc]]) => {
				const hasDefault = def !== null && def !== undefined
				const defaultText = hasDefault
					? ` (default: ${JSON.stringify(def)})`
					: ""

				rows.push(`  --${name.padEnd(20)} ${desc}${defaultText}`)
			})
			rows.push("")
		}

		// Subcommands
		if (this.children.length > 0) {
			rows.push("Commands:")
			this.children.forEach(child => {
				rows.push(`  ${child.name.padEnd(20)} ${child.help}`)
			})
			rows.push("")
		}

		return rows.filter(r => r).join("\n")
	}

	/**
	 * Executes command with message
	 *
	 * @param {CommandMessage} message - Message to execute
	 * @returns {AsyncGenerator} - Execution result
	 */
	async * execute(message) {
		try {
			yield* this.run(message)
		} catch (error) {
			if (error instanceof CommandError) {
				throw error
			}
			throw new CommandError("Command execution failed", {
				message: error.message,
				stack: error.stack
			})
		}
	}

	/**
	 * @private
	 * Applies default values to message options
	 *
	 * @param {CommandMessage} msg - Message to apply defaults to
	 */
	_applyDefaults(msg) {
		for (const [name, [type, def]] of Object.entries(this.options)) {
			if (!(name in msg.opts)) {
				msg.opts[name] = (def !== null && def !== undefined)
					? def
					: (type === Boolean ? false : null)
			}
		}
	}
}

// Import helper functions locally to avoid circular dependencies
function handleLongOption(msg, argv, index) {
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

function handleShortOption(msg, argv, index) {
	const curr = argv[index].slice(1)

	if (curr.length > 1) {
		for (const char of curr) {
			msg.opts[char] = true
		}
	} else {
		const key = curr
		if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
			msg.opts[key] = argv[index + 1]
		} else {
			msg.opts[key] = true
		}
	}
}

function updateIndexAfterOption(argv, index) {
	const curr = argv[index]
	
	if (curr.includes('=')) {
		return index + 1
	}
	
	const nextIsValue = index + 1 < argv.length &&
		!argv[index + 1].startsWith('-')

	return nextIsValue ? index + 2 : index + 1
}