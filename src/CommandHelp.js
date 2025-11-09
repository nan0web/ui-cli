import Logger from "@nan0web/log"

/**
 * @docs
 * # CommandHelp
 *
 * Generates help text for commands using domain model.
 */
export default class CommandHelp {
	/** @type {string} */
	name
	/** @type {string} */
	help = ""
	/** @type {typeof Object} */
	Body
	/** @type {Logger} */
	logger = new Logger()

	/**
	 * Creates a new CommandHelp instance
	 *
	 * @param {object} config - Configuration object
	 * @param {string} config.name - Command name
	 * @param {string} [config.help=""] - Command description
	 * @param {typeof Object} config.Body - Command body class
	 * @param {Logger} [config.logger=new Logger()] - Logger instance
	 */
	constructor(config) {
		const {
			name,
			help = this.help,
			Body,
			logger = this.logger
		} = config
		this.name = String(name)
		this.help = String(help)
		this.Body = Body
		this.logger = Logger.from(logger)
	}

	/**
	 * Generates and prints help text
	 */
	print() {
		const bodyProps = this.#getBodyProperties()

		// Header
		const brand = Logger.style(this.name, { color: Logger.MAGENTA })
		this.logger.info(`${brand} - ${this.help}\n`)

		// Usage: auth login --username=<value> --password=<value>
		const usage = `Usage: ${this.name} ` +
			bodyProps.map(p => {
				const alias = this.#getAlias(p)
				const flag = alias ? `-${alias}, --${p}` : `--${p}`
				return `${flag}=${this.#getPlaceholder(p)}`
			}).join(' ')
		this.logger.info(usage + "\n")

		// Options
		this.logger.info("Options:")
		for (const prop of bodyProps) {
			const alias = this.#getAlias(prop)
			const flags = alias ? `--${prop}, -${alias}` : `--${prop}`
			const propName = `  ${flags}`
			const propHelp = this.#getHelp(prop)
			const propType = this.#getType(prop)

			this.logger.info(`  ${propName.padEnd(20)} ${propType.padEnd(10)} ${propHelp}`)
		}
	}

	/**
	 * Gets Body properties
	 *
	 * @returns {string[]} - Array of property names
	 */
	#getBodyProperties() {
		return Object.keys(new this.Body())
	}

	/**
	 * Gets alias for a property
	 *
	 * @param {string} propName - Property name
	 * @returns {string|null} - Alias or null
	 */
	#getAlias(propName) {
		return this.Body[propName]?.alias ?? null
	}

	/**
	 * Gets help text for a property
	 *
	 * @param {string} propName - Property name
	 * @returns {string} - Help text
	 */
	#getHelp(propName) {
		const help = this.Body[propName]?.help ?? this.Body[`${propName}Help`]
		if (help) return help

		// Add automatic help based on validation
		const validation = this.Body[propName]?.validation ?? this.Body[`${propName}Validation`]
		if (typeof validation === 'function') {
			return `Field with validation rules`
		}

		return "No description"
	}

	/**
	 * Gets type of a property
	 *
	 * @param {string} propName - Property name
	 * @returns {string} - Type name
	 */
	#getType(propName) {
		const body = new this.Body()
		const example = body[propName]
		return typeof example
	}

	/**
	 * Gets placeholder for a property
	 *
	 * @param {string} propName - Property name
	 * @returns {string} - Placeholder text
	 */
	#getPlaceholder(propName) {
		const placeholder = this.Body[propName]?.placeholder ?? this.Body[`${propName}Placeholder`]
		if (placeholder) return placeholder

		return `<${propName}>`
	}
}
