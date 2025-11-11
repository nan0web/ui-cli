/**
 * Input module – provides utilities to read user input from the console.
 *
 * @module ui/input
 */

import { createInterface } from "node:readline"
import { stdin, stdout } from "node:process"

/**
 * @typedef {Function} InputFn
 * @param {string} question - Prompt displayed to the user.
 * @param {Function|boolean} [loop=false] - Loop control or validator.
 * @param {Function|false} [nextQuestion=false] - Function to compute the next prompt.
 * @returns {Promise<Input>} Resolves with an {@link Input} instance containing the answer.
 */

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
	value = ""
	/** @type {string[]} */
	stops = []
	#cancelled = false

	/**
	 * Create a new {@link Input} instance.
	 *
	 * @param {Object} [input={}] - Optional initial values.
	 * @param {string} [input.value] - Initial answer string.
	 * @param {boolean} [input.cancelled] - Initial cancel flag.
	 * @param {string|string[]} [input.stops] - Words that trigger cancellation.
	 */
	constructor(input = {}) {
		const {
			value = this.value,
			cancelled = this.#cancelled,
			stops = [],
		} = input

		this.value = String(value)

		const normalizedStops = Array.isArray(stops) ? stops : [stops].filter(Boolean)
		this.stops = normalizedStops.map(String)

		this.#cancelled = Boolean(cancelled)
	}

	/**
	 * Returns whether the input has been cancelled either explicitly or via a stop word.
	 *
	 * @returns {boolean}
	 */
	get cancelled() {
		return this.#cancelled || this.stops.includes(this.value)
	}

	/** @returns {string} The raw answer value. */
	toString() {
		return this.value
	}
}

/**
 * Prompt a question and return the trimmed answer.
 *
 * @param {string} question - Text displayed as a prompt.
 * @returns {Promise<string>} User answer without surrounding whitespace.
 */
export async function ask(question) {
	return new Promise(resolve => {
		const rl = createInterface({ input: stdin, output: stdout, terminal: true })
		rl.question(question, answer => {
			rl.close()
			resolve(answer.trim())
		})
	})
}

/**
 * Factory that creates a reusable async input handler.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @returns {InputFn} Async function that resolves to an {@link Input}.
 */
export function createInput(stops = []) {
	const input = new Input({ stops })

	/**
	 * Internal handler used by the factory.
	 *
	 * @param {string} question - Prompt displayed to the user.
	 * @param {Function|boolean} [loop=false] - Loop‑control flag or validator.
	 * @param {Function|false} [nextQuestion=false] - Next prompt generator.
	 * @returns {Promise<Input>}
	 */
	async function fn(question, loop = false, nextQuestion = false) {
		while (true) {
			input.value = await ask(question)

			if (false === loop || input.cancelled) return input
			if (true === loop && input.value) return input
			if (typeof loop === "function") {
				if (!loop(input)) return input
			}
			if (typeof nextQuestion === "string") question = nextQuestion
			if (typeof nextQuestion === "function") question = nextQuestion(input)
		}
	}
	return fn
}

export default createInput