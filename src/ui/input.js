/**
 * Input module – provides utilities to read user input from the console.
 *
 * @module ui/input
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import process from 'node:process'

/**
 * Triggers a system beep (ASCII Bell).
 */
export function beep() {
	process.stdout.write('\u0007')
}

/**
 * Represents a line of user input.
 *
 * @class
 * @property {string} value – The raw answer string.
 * @property {string[]} stops – Words that trigger cancellation.
 * @property {boolean} cancelled – True when the answer matches a stop word.
 */
export class Input {
	/** @type {string} */
	value = ''
	/** @type {string[]} */
	stops = []
	#cancelled = false

	constructor(input = {}) {
		const { value = this.value, cancelled = this.#cancelled, stops = [] } = input
		this.value = String(value)
		this.stops = stops
		this.#cancelled = Boolean(cancelled)
	}

	get cancelled() {
		return this.#cancelled || this.stops.includes(this.value)
	}

	toString() {
		return this.value
	}
}

/**
 * Modern text input with validation and default value.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} [config.initial] - Default value
 * @param {string} [config.type] - Prompt type (text, password, etc)
 * @param {(value:string)=>boolean|string|Promise<boolean|string>} [config.validate] - Validator
 * @param {(value:string)=>string} [config.format] - Formatter
 * @returns {Promise<{value:string, cancelled:boolean}>}
 */
export async function text(config) {
	const { message, initial, validate, type = 'text', format } = config
	const response = await prompts({
		type: type,
		name: 'value',
		message,
		initial,
		validate,
		format
	}, {
		onCancel: () => {
			throw new CancelError()
		}
	})

	return { value: response.value, cancelled: false }
}


/**
 * Factory that creates a reusable async input handler.
 * Adapter for legacy ask() signature.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {Object} [console] Optional console instance.
 * @param {(input: Input) => Promise<boolean>|boolean} [loop] Optional loop validator.
 * @returns {Function} Async function that resolves to an {@link Input}.
 */
export function createInput(stops = [], predef = undefined, console = undefined, loop = undefined) {
	return async function ask(question, loopVal = loop, nextQuestion = undefined) {
		const currentLoop = typeof loopVal === 'function' ? loopVal : loop
		if (predef !== undefined) {
			prompts.inject([predef])
		}

		// Map options to prompts config
		let validationFn = undefined

		if (typeof currentLoop === 'function') {
			validationFn = async (val) => {
				if (stops.includes(val)) return true
				// Loop returns true to CONTINUE (invalid), false to STOP (valid).
				// prompts returns true for VALID, string/false for INVALID.
				const inputObj = new Input({ value: val, stops })
				if (inputObj.cancelled) return true

				const shouldContinue = await currentLoop(inputObj)
				return shouldContinue ? 'Invalid input' : true
			}
		}

		const result = await text({
			message: question,
			validate: validationFn
		})

		return new Input({ value: result.value, stops })
	}
}

/**
 * High‑level input helper `ask`.
 * Use this for simple string prompts.
 */
export const ask = createInput()

/**
 * Mock helper for predefined inputs (Testing).
 */
export function createPredefinedInput(predefined, console, stops = []) {
	const strPredefined = predefined.map(String)
	let index = 0
	return async function (question) {
		if (index >= strPredefined.length) {
			throw new CancelError('No more predefined answers')
		}
		const val = strPredefined[index++]
		if (console) console.info(`${question}${val}`)
		return new Input({ value: val, stops })
	}
}

