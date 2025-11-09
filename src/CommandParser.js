import { Message } from "@nan0web/co"

/**
 * Parses CLI arguments into domain messages.
 *
 * Automatically generates flags from message body properties and supports nested commands.
 *
 * @example
 * ```js
 * const parser = new CommandParser(SomeMessage)
 * const message = parser.parse(['--flag', 'value'])
 * ```
 */
export default class CommandParser {
	/**
	 * Creates a command parser for a specific message class.
	 *
	 * @param {typeof Message} Message - The root message class to parse commands for
	 */
	constructor(Message) {
		/**
		 * The root message class
		 * @type {typeof Message}
		 */
		this.Message = Message

		/**
		 * Command tree built from message hierarchy
		 * @type {Object}
		 */
		this.Commands = this.#buildCommandTree(Message)
	}

	/**
	 * Builds a command tree according to message hierarchy.
	 *
	 * @param {typeof Message} Message - Current message class with static.name and static.Children?
	 * @param {string[]} path - Path to current command
	 * @returns {Object} Command tree node
	 */
	#buildCommandTree(Message, path = []) {
		const config = this.#extractConfig(Message)
		// @ts-ignore Children might be missing
		const children = (Message.Children || []).map(C =>
			this.#buildCommandTree(C, [...path, Message.name])
		)

		return {
			...config,
			path,
			children: Object.fromEntries(children.map(c => [c.name, c]))
		}
	}

	/**
	 * Extracts configuration from a domain message.
	 *
	 * @param {typeof Message} Message - Message class to extract config from with static.name, static.help, static.Body,
	 * @returns {Object} Configuration object
	 */
	#extractConfig(Message) {
		return {
			name: Message.name,
			// @ts-ignore help might be missing
			help: Message.help ?? "",
			Body: Message.Body,
			MessageClass: Message,
			/**
			 * Creates a new message instance.
			 *
			 * @param {any} value - Value to initialize message with
			 * @returns {Message} New message instance
			 */
			create: (value) => new Message(value)
		}
	}

	/**
	 * Parses CLI arguments into a domain message.
	 *
	 * @param {string[]} argv - CLI arguments to parse
	 * @returns {Message} Parsed message instance
	 * @throws {Error} When unknown command is provided
	 */
	parse(argv) {
		let tokens = this.#tokenize(argv)
		const cmd = this.#findCommand(tokens, this.Commands)

		if (!cmd) {
			throw new Error(`Unknown command: ${tokens[0] || 'root'}`)
		}

		const body = this.#parseBody(tokens, cmd.Body)
		return cmd.create({ body })
	}

	/**
	 * Converts CLI arguments into tokens.
	 *
	 * Handles short flag expansion (e.g. -abc becomes --a --b --c).
	 *
	 * @param {string[]} argv - Raw CLI arguments
	 * @returns {string[]} Tokenized arguments
	 */
	#tokenize(argv) {
		return argv.flatMap(arg => {
			if (arg.startsWith('-') && !arg.startsWith('--') && arg.length > 2) {
				// Convert short flags -abc to --a --b --c
				return arg.slice(1).split('').map(c => `--${c}`)
			} else if (arg.startsWith('-') && !arg.startsWith('--') && arg.length === 2) {
				// Convert short flag -a to --a
				return [`--${arg.slice(1)}`]
			}
			return [arg]
		})
	}

	/**
	 * Finds the corresponding command in the tree.
	 *
	 * @param {string[]} tokens - Tokenized CLI arguments
	 * @param {Object} commands - Current command tree node
	 * @returns {Object|null} Found command or null
	 */
	#findCommand(tokens, commands) {
		if (tokens.length === 0) return commands

		const cmdName = tokens[0].replace(/^-+/, '')
		if (commands.children?.[cmdName]) {
			return this.#findCommand(tokens.slice(1), commands.children[cmdName])
		}

		// If we've reached here and there are still tokens, it means we couldn't find a matching command
		if (tokens.length > 0 && tokens[0].startsWith('--') === false) {
			return null
		}

		return commands
	}

	/**
	 * Parses message body from CLI tokens.
	 *
	 * @param {string[]} tokens - Tokenized CLI arguments
	 * @param {typeof Object} Body - Message body class
	 * @returns {Object} Parsed body instance
	 */
	#parseBody(tokens, Body) {
		/** @type {any} */
		const body = new Body()
		const bodyProps = this.#getBodyProperties(Body)

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i]

			if (token.startsWith('--')) {
				const propName = this.#resolveAlias(token.slice(2), Body) || token.slice(2)
				if (bodyProps.has(propName)) {
					// Check if next token is not a new flag
					if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
						body[propName] = this.#convertType(propName, tokens[++i], Body)
					} else {
						body[propName] = true
					}
				}
			}
		}

		return body
	}

	/**
	 * Resolves alias to property name.
	 *
	 * @param {string} alias - Alias to resolve
	 * @param {typeof Object} Body - Message body class
	 * @returns {string|null} Resolved property name or null
	 */
	#resolveAlias(alias, Body) {
		const staticProps = Object.getOwnPropertyNames(Body)
		for (const prop of staticProps) {
			if (Body[prop] && Body[prop].alias === alias) {
				return prop
			}
		}
		return null
	}

	/**
	 * Gets body properties for validation.
	 *
	 * @param {typeof Object} Body - Message body class
	 * @returns {Set<string>} Set of body property names
	 */
	#getBodyProperties(Body) {
		/** @type {any} */
		const props = new Body()
		return new Set(Object.keys(props))
	}

	/**
	 * Converts a value to the required type based on body property.
	 *
	 * @param {string} propName - Property name
	 * @param {string} value - Raw value
	 * @param {typeof Object} Body - Message body class
	 * @returns {any} Converted value
	 */
	#convertType(propName, value, Body) {
		/** @type {any} */
		const example = new Body()
		const propType = typeof example[propName]

		switch (propType) {
			case 'boolean':
				return value.toLowerCase() !== 'false'
			case 'number':
				return Number(value)
			default:
				return String(value)
		}
	}
}
