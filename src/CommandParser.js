/**
 * CommandParser – parses argv into a hierarchical message tree supporting sub‑commands.
 *
 * @module CommandParser
 */

import { Message } from '@nan0web/co'
import CommandHelp from './CommandHelp.js'
import CommandError from './CommandError.js'
import { str2argv } from './utils/parse.js'

/**
 * @class
 */
export default class CommandParser {
	/** @type {Array<Function>} */
	Messages

	/**
	 * @param {Array<Function>} [Messages=[]] - Root message classes.
	 */
	constructor(Messages = []) {
		this.Messages = Array.isArray(Messages) ? Messages : [Messages]
	}

	/**
	 * Parse the provided input into a message hierarchy.
	 *
	 * @param {string|string[]} [input=process.argv.slice(2)] - CLI arguments.
	 * @returns {Message}
	 * @throws {Error} If no command is supplied or unknown root command.
	 */
	parse(input = process.argv.slice(2)) {
		const argv = typeof input === 'string' ? str2argv(input) : input
		if (argv.length === 0) throw new Error('No command provided')
		let rootName = null
		let remaining = argv

		if (!argv[0].startsWith('-')) {
			rootName = argv[0]
			remaining = argv.slice(1)

			let RootClass = this.Messages.find((cls) => cls.name.toLowerCase() === rootName.toLowerCase())
			if (!RootClass) {
				if (this.Messages.length === 1) RootClass = this.Messages[0]
				else throw new Error(`Unknown root command: ${rootName}`)
			}
			// @ts-ignore – `RootClass` may not be a concrete `Message` subclass from TS view
			const rootMessage = new RootClass({})
			if (rootName) {
				if (!rootMessage.head) rootMessage.head = {}
				rootMessage.head.name = rootName
			}
			return this.#processMessageTree(rootMessage, remaining)
		}

		if (this.Messages.length !== 1) throw new Error('Unable to infer root command from options')
		// @ts-ignore – see comment above
		const RootClass = this.Messages[0]
		// @ts-ignore
		const rootMessage = new RootClass({})
		if (!rootMessage.head) rootMessage.head = {}
		return this.#processMessageTree(rootMessage, remaining)
	}

	/**
	 * Walk the message tree and attach sub‑commands and leaf arguments.
	 *
	 * @param {Message} rootMessage - Root message instance.
	 * @param {string[]} remainingTokens - Tokens yet to be processed.
	 * @returns {Message}
	 */
	#processMessageTree(rootMessage, remainingTokens) {
		let currentMessage = rootMessage
		let remaining = remainingTokens

		// @ts-ignore – `Children` is a static property on concrete message classes
		while (currentMessage.constructor.Children && remaining.length) {
			const subName = remaining[0]
			// @ts-ignore
			const SubClass = currentMessage.constructor.Children.find(
				(cls) => cls.name.toLowerCase() === subName.toLowerCase()
			)
			if (!SubClass) break

			// @ts-ignore
			const subMessage = new SubClass({})
			subMessage.name = subName
			currentMessage.body.subCommand = subMessage
			currentMessage = subMessage
			remaining = remaining.slice(1)
		}

		if (remaining.length) {
			const parsedBody = this.#parseLeafBody(
				remaining,
				// @ts-ignore – `Body` may be undefined on some classes
				currentMessage.constructor.Body
			)
			currentMessage.body = { ...currentMessage.body, ...parsedBody }
		}

		if (
			rootMessage.body.subCommand &&
			typeof rootMessage.body.subCommand.assertValid === 'function'
		) {
			rootMessage.body.subCommand.assertValid()
		}
		return rootMessage
	}

	/**
	 * Parse leaf‑level arguments into the provided body class.
	 *
	 * @param {string[]} tokens - Remaining CLI tokens.
	 * @param {typeof Message} BodyClass - Class defining fields and validation.
	 * @returns {Object} Instance of BodyClass populated with parsed values.
	 */
	#parseLeafBody(tokens, BodyClass) {
		const body = new BodyClass()
		const props = Object.keys(body)

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i]

			if (token.startsWith('--')) {
				let key = token.slice(2)
				/** @type {boolean | string} */
				let value = true
				const eqIdx = key.indexOf('=')
				if (eqIdx > -1) {
					value = key.slice(eqIdx + 1)
					key = key.slice(0, eqIdx)
				} else if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
					value = tokens[++i]
				}
				const realKey = this.#resolveAlias(key, BodyClass) || key
				if (props.includes(realKey)) body[realKey] = this.#convertType(body[realKey], value)
			} else if (token.startsWith('-') && token.length > 1) {
				const short = token.slice(1)
				if (short.length > 1) {
					short.split('').forEach((ch) => {
						const realKey = this.#resolveAlias(ch, BodyClass)
						if (realKey && props.includes(realKey)) body[realKey] = true
					})
				} else {
					const realKey = this.#resolveAlias(short, BodyClass) || short
					if (props.includes(realKey)) {
						/** @type {boolean | string} */
						let value = true
						if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
							value = tokens[++i]
						}
						const type = typeof body[realKey]
						if ('object' === type && Array.isArray(body[realKey])) {
							body[realKey].push(this.#convertType(body[realKey], value))
						} else {
							body[realKey] = this.#convertType(body[realKey], value)
						}
					}
				}
			} else {
				const first = props[0]
				if (first) body[first] = token
			}
		}

		props.forEach((prop) => {
			const schema = BodyClass[prop]
			if (schema?.default !== undefined && body[prop] === undefined) {
				body[prop] = schema.default
			}
			const err = schema?.validate?.(body[prop], body)
			if (err !== undefined && err !== null && err !== true) {
				throw new CommandError(`Invalid ${prop}: ${err}`, { [prop]: err })
			}
		})

		return body
	}

	/**
	 * Resolve an alias to its full property name.
	 *
	 * @param {string} alias
	 * @param {Function} BodyClass
	 * @returns {string|null}
	 */
	#resolveAlias(alias, BodyClass) {
		for (const [prop, schema] of Object.entries(BodyClass)) {
			if (schema?.alias === alias) return prop
		}
		return null
	}

	/**
	 * Convert a raw CLI string to the appropriate JavaScript type.
	 *
	 * @param {*} defaultVal - The default value used for type inference.
	 * @param {*} value - Raw parsed value.
	 * @returns {*}
	 */
	#convertType(defaultVal, value) {
		const type = typeof defaultVal
		if (type === 'boolean') return Boolean(value !== 'false' && value !== false && value !== '')
		if (type === 'number') return Number(value) || 0
		return String(value)
	}

	/**
	 * Generate help text for a given message class.
	 *
	 * @param {typeof Message} MessageClass
	 * @returns {string}
	 */
	generateHelp(MessageClass) {
		return new CommandHelp(MessageClass).generate()
	}
}
