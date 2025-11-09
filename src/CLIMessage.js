import Command from "./Command.js"
import CommandMessage from "./CommandMessage.js"

/**
 * CLIMessage – a bridge between souls through command implementation.
 *
 * **Philosophy**: You do not exchange information.
 * You create a bridge between souls through the resonance of shared existence.
 */
export default class CLIMessage {
	/**
	 * @typedef {Object} MessageSchema
	 * @property {string} name - Name of the command
	 * @property {string} [help] - Help text for the command
	 * @property {Object} [Schema] - Class with option definitions
	 * @property {Function} [run] - Execution function
	 * @property {MessageSchema[]} [Children] - Child schemas
	 */

	/**
	 * Creates a CLI message parser with given schemas
	 *
	 * @param {MessageSchema[]} messageSchemas - Schemas to build command structure
	 */
	constructor(messageSchemas) {
		this.root = new Command({
			name: "root",
			children: messageSchemas.map(schema => this._createCommand(schema))
		})
	}

	/**
	 * Parses command line arguments into structured messages
	 *
	 * @param {string | string[]} argv - Arguments to parse
	 * @returns {Object} - Structured message with full hierarchy
	 */
	parse(argv) {
		try {
			const message = this.root.parse(argv)
			return this._hydrateMessage(message)
		} catch (error) {
			if (error instanceof Error && !error.name) {
				throw new Error(`Invalid command structure: ${error.message}`)
			}
			throw error
		}
	}

	/**
	 * Creates a command from a message schema
	 *
	 * @private
	 * @param {MessageSchema} schema - Schema in GitMessage format
	 * @returns {Command}
	 */
	_createCommand(schema) {
		return new Command({
			name: schema.name ?? schema.constructor.name ?? "",
			help: schema.help ?? "",
			options: this._extractOptions(schema),
			run: schema.run,
			children: (schema.Children || []).map(c => this._createCommand(c))
		})
	}

	/**
	 * Extracts options from Schema class
	 *
	 * @private
	 * @param {MessageSchema} schema - Schema with Schema property
	 * @returns {Object}
	 */
	_extractOptions(schema) {
		const options = {}
		const schemaClass = schema.Schema
		
		if (!schemaClass) return options

		// Get all static properties from the schema class
		const staticProps = Object.getOwnPropertyNames(schemaClass)
			.filter(prop => !prop.startsWith('length') && !prop.startsWith('name') && !prop.startsWith('prototype'))
		
		for (const key of staticProps) {
			if (key.endsWith("Help") || key.endsWith("Alias")) continue

			const val = schemaClass[key]
			const helpKey = `${key}Help`
			const help = schemaClass[helpKey] || "No description"
			const aliasKey = `${key}Alias`
			const alias = schemaClass[aliasKey] || ""

			options[key] = [
				typeof val === 'boolean' ? Boolean : 
				typeof val === 'number' ? Number : 
				typeof val === 'string' ? String : 
				val?.constructor || String,
				val,
				help,
				alias
			]
		}

		return options
	}

	/**
	 * Hydrates message with data based on schema
	 *
	 * @private
	 * @param {CommandMessage} message - Message to hydrate
	 * @returns {Object} - Validated message with your class structure
	 */
	_hydrateMessage(message) {
		let current = this.root
		let msg = message
		let commandName = "root"

		// Find actual command based on first argument
		if (msg.name) {
			const subcommand = this.root.findSubcommand(msg.name)
			if (subcommand) {
				current = subcommand
				commandName = msg.name
			}
		}

		// Handle nested subcommands
		while (msg.subCommandMessage && msg.subCommandMessage.name) {
			const nextCommand = current.findSubcommand(msg.subCommandMessage.name)
			if (nextCommand) {
				current = nextCommand
				commandName = msg.subCommandMessage.name
				msg = msg.subCommandMessage
			} else {
				break
			}
		}

		// Create body with appropriate schema
		const schema = current.options
		const body = {}

		// Apply option values or defaults
		for (const [key, [type, def]] of Object.entries(schema)) {
			let value = msg.opts[key]

			// Type conversion if needed
			if (value !== undefined && value !== null) {
				if (type === Number) value = Number(value)
				if (type === Boolean) value = value !== "false" && value !== false && value !== ""
			} else {
				// Use default value if provided
				value = def
			}

			body[key] = value
		}

		// Return message matching your class structure
		return {
			name: commandName,
			body,
			argv: msg.argv,
			opts: msg.opts,
			subCommand: msg.subCommand,
			subCommandMessage: msg.subCommandMessage,
			toString: () => message.toString()
		}
	}
}