import { Message } from "@nan0web/co"
import Logger from "@nan0web/log"

/**
 * @typedef {Object} CommandHelpField
 * @property {string} [help]        - Human readable description.
 * @property {string} [placeholder] - Placeholder for usage (e.g. "<user>").
 * @property {string} [alias]       - Short alias (single‑letter).
 */

/**
 * CommandHelp – generates CLI help from a Message body schema.
 * Supports nesting via static `Children`; message‑centric.
 *
 * @example
 * const help = new CommandHelp(AuthMessage)
 * console.log(help.generate())        // → formatted help string
 * help.print()                       // → logs to console
 */
export default class CommandHelp {
	/** @type {typeof Message} Message class the help is built for */
	MessageClass
	/** @type {Logger} Logger used for printing */
	logger
	/** @type {typeof Message.Body} Body class reference */
	BodyClass

	/**
	 * @param {typeof Message} MessageClass - Message class with a schema.
	 * @param {Logger} [logger=new Logger()] - Optional logger.
	 */
	constructor(MessageClass, logger = new Logger()) {
		this.MessageClass = MessageClass
		this.logger = logger
		this.BodyClass = MessageClass.Body
	}

	/** @returns {typeof Logger} */
	get Logger() {
		return /** @type {typeof Logger} */ (this.logger.constructor)
	}

	/**
	 * Generates the full help text.
	 *
	 * @returns {string} Formatted help text.
	 */
	generate() {
		const lines = []
		this.#header(lines)
		this.#usage(lines)
		this.#options(lines)
		this.#subcommands(lines)
		return lines.join("\n")
	}

	/**
	 * Prints the generated help to the logger.
	 */
	print() {
		this.logger.info(this.generate())
	}

	/**
	 * Adds a coloured header.
	 *
	 * @param {string[]} lines - Accumulator array.
	 */
	#header(lines) {
		const name = this.MessageClass.name.toLowerCase()
		const help = this.MessageClass['help'] || ""
		lines.push([
			`${this.Logger.style(name, { color: this.Logger.MAGENTA })}`,
			help
		].filter(Boolean).join(" • "))
		lines.push("")
	}

	/**
	 * Constructs the usage line.
	 *
	 * @param {string[]} lines - Accumulator array.
	 */
	#usage(lines) {
		const name = this.MessageClass.name.toLowerCase()
		const bodyInstance = new this.BodyClass()
		const bodyProps = Object.keys(bodyInstance)

		if (bodyProps.length === 0) {
			lines.push(`Usage: ${name}`)
			lines.push("")
			return
		}

		const placeholderParts = []
		const flagParts = []

		bodyProps.forEach(prop => {
			const schema = this.BodyClass[prop] || {}
			const alias = schema.alias ? `-${schema.alias}, ` : ""
			if (schema.placeholder) {
				placeholderParts.push(`[${alias}--${prop}=${schema.placeholder}]`)
			} else {
				flagParts.push(`[${alias}--${prop}]`)
			}
		})

		// Build usage string respecting spacing rules:
		//   * when only flags exist → separate with " , "
		//   * when placeholders exist:
		//       – if exactly ONE flag part → prepend with ", "
		//       – otherwise just space‑separate all parts.
		let usage = ""
		if (placeholderParts.length) {
			usage = placeholderParts.join(" ")
			if (flagParts.length) {
				if (flagParts.length === 1) {
					usage = `${usage}, ${flagParts[0]}`
				} else {
					usage = `${usage} ${flagParts.join(" ")}`
				}
			}
		} else {
			// only flag parts
			usage = flagParts.join(" , ")
		}
		lines.push(`Usage: ${name} ${usage}`)
		lines.push("")
	}

	/**
	 * Renders the Options section.
	 *
	 * @param {string[]} lines - Accumulator array.
	 */
	#options(lines) {
		const bodyInstance = new this.BodyClass()
		const bodyProps = Object.keys(bodyInstance)
		if (bodyProps.length === 0) return

		lines.push("Options:")
		bodyProps.forEach(prop => {
			const schema = this.BodyClass[prop] || {}
			if (typeof schema !== "object") return

			const flags = schema.alias
				? `--${prop}, -${schema.alias}`
				: `--${prop}`

			const type = schema.placeholder !== undefined ? "string" : "boolean"
			const required = schema.default === undefined ? " *" : ""
			const description = schema.help || "No description"

			// Pad flags to align the type column with the expectations.
			lines.push(`  ${flags.padEnd(30)} ${type.padEnd(8)}${required}  ${description}`)
		})
		lines.push("")
	}

	/**
	 * Renders Subcommands, if any.
	 *
	 * @param {string[]} lines - Accumulator array.
	 */
	#subcommands(lines) {
		const children = this.MessageClass['Children'] || []
		if (children.length === 0) return

		lines.push("Subcommands:")
		children.forEach(ChildClass => {
			const childName = ChildClass.name.toLowerCase()
			const childHelp = ChildClass.help || "No description"
			lines.push(`  ${childName.padEnd(20)}  ${childHelp}`)
		})
		lines.push("")
	}
}
