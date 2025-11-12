/**
 * CLI – top‑level runner that orchestrates command execution and help generation.
 *
 * @module CLI
 */

import { Message, InputMessage, OutputMessage } from "@nan0web/co"
import Logger from "@nan0web/log"
import CommandParser from "./CommandParser.js"
import CommandHelp from "./CommandHelp.js"

/**
 * Main CLI class.
 */
export default class CLI {
	/** @type {string[]} */
	argv = []
	#commands = new Map()
	/** @type {Logger} */
	logger
	/** @type {Array<Function>} */
	Messages = []

	/**
	 * @param {Object} [input={}]
	 * @param {string[]} [input.argv] - Command‑line arguments (defaults to `process.argv.slice(2)`).
	 * @param {Object} [input.commands] - Map of command names to handlers.
	 * @param {Logger} [input.logger] - Optional logger instance.
	 * @param {Array<Function>} [input.Messages] - Message classes for root commands.
	 */
	constructor(input = {}) {
		const {
			argv = process.argv.slice(2),
			commands = {},
			logger,
			Messages = [],
		} = input
		this.argv = argv.map(String).filter(Boolean)
		this.logger = logger ?? new Logger({ level: Logger.detectLevel(this.argv) })
		this.Messages = Messages
		this.#commands = new Map(Object.entries(commands))
		this.#commands.set("help", () => this.#help())
		if (Messages.length > 0) this.#registerMessageCommands(Messages)
	}

	/** @returns {Map<string,Function>} The command map. */
	get commands() {
		return this.#commands
	}

	/**
	 * Register message‑based commands derived from classes.
	 *
	 * @param {any} cmdClasses - Array of Message classes exposing a `run` generator.
	 */
	#registerMessageCommands(cmdClasses) {
		cmdClasses.forEach(Class => {
			const cmd = Class.name.toLowerCase()
			this.#commands.set(cmd, async function* (msg) {
				const validated = new Class(msg.body)
				/** @ts-ignore – only content needed for tests */
				yield new OutputMessage({ content: [`Executed ${cmd} with body: ${JSON.stringify(validated.body)}`] })
				if (typeof Class.run === "function") yield* Class.run(validated)
			})
		})
	}

	/**
	 * Execute the CLI workflow.
	 *
	 * @param {Message} [msg] - Optional pre‑built message.
	 * @yields {OutputMessage|InputMessage}
	 */
	async * run(msg) {
		// @ts-ignore – `Message` may carry a `value` wrapper in some contexts
		const command = msg?.value?.body?.command ?? this.#parseCommandName()
		const fn = this.#commands.get(command)

		if (!fn) {
			yield { content: `Unknown command: ${command}` }
			return
		}

		let fullMsg
		if (this.Messages.length > 0) {
			const parser = new CommandParser(this.Messages)
			fullMsg = parser.parse(this.argv)
			yield new InputMessage({ value: { body: { command } } })
		} else {
			fullMsg = msg ?? new InputMessage({ value: { body: { command } } })
		}

		for await (const out of fn(fullMsg)) {
			if (out.isError) this.logger.error(out.content)
			else this.logger.info(out.content)
			yield out
		}
	}

	/**
	 * Determine the command name from the positional arguments.
	 *
	 * @returns {string}
	 */
	#parseCommandName() {
		return this.argv.find(arg => !arg.startsWith("-")) || "help"
	}

	/**
	 * Generate help output for all registered commands.
	 *
	 * @yields {OutputMessage}
	 */
	async * #help() {
		const lines = ["Available commands:"]
		for (const [name] of this.#commands) lines.push(`  ${name}`)
		if (this.Messages.length > 0) {
			lines.push("\nMessage‑based commands:")
			this.Messages.forEach(Class => {
				// @ts-ignore – `CommandHelp` expects a class extending `Message`; casting to any silences TS
				const help = new CommandHelp(Class).generate().split("\n")[0]
				lines.push(`  ${Class.name.toLowerCase()}: ${help}`)
			})
		}
		/** @ts-ignore – output only needs `content` */
		yield new OutputMessage({ content: lines })
	}

	/**
	 * Factory to create a CLI instance from various inputs.
	 *
	 * @param {CLI|Object} input - Existing CLI instance or configuration object.
	 * @returns {CLI}
	 * @throws {TypeError} If input is neither a CLI nor an object.
	 */
	static from(input) {
		if (input instanceof CLI) return input
		if (input && typeof input === "object") return new CLI(input)
		throw new TypeError("CLI.from expects an object or CLI instance")
	}
}
