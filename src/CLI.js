import { InputMessage, OutputMessage } from "@nan0web/co"
import Logger from "@nan0web/log"

export default class CLI {
	/** @type {string[]} */
	argv = []
	/** @type {Map<string, (msg: InputMessage) => AsyncGenerator<OutputMessage>>} */
	commands = new Map()
	/** @type {Logger} */
	logger

	constructor(input = {}) {
		const {
			argv = this.argv,
			commands = this.commands,
			logger,
		} = input
		this.argv = argv.map(String).filter(Boolean)
		this.logger = logger ?? new Logger({ level: Logger.detectLevel(this.argv) })
		this.commands = commands instanceof Map ? commands : new Map(commands)

		this.commands.set("help", this.help.bind(this))
	}

	/**
	 * @param {InputMessage} msg
	 * @return {AsyncGenerator<OutputMessage>}
	 */
	async * run(msg) {
		const command = msg.value.body?.command ?? "help"
		const fn = this.commands.get(command)
		if (!fn) {
			throw new Error(["Command not found", command].join(": "))
		}
		for await (const output of fn(msg)) {
			if (output.isError) {
				this.logger.error(output.content)
			}
			else {
				this.logger.info(output.content)
			}
			yield output
		}
	}

	/**
	 * @param {InputMessage} msg
	 * @return {AsyncGenerator<OutputMessage>}
	 */
	async * help(msg) {
		const tab = "  "
		const rows = []
		rows.push("Available commands")
		for (const [name, fn] of this.commands) {
			rows.push(tab.repeat(1) + name)
		}
		yield new OutputMessage(rows)
	}

	/**
	 * @param {any} input
	 * @returns {CLI}
	 */
	static from(input) {
		if (input instanceof CLI) return input
		return new CLI(input)
	}
}
