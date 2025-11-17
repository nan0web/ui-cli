/**
 * Input module – provides utilities to read user input from the console.
 *
 * @module ui/input
 */

import { createInterface } from "node:readline"
import { stdin, stdout } from "node:process"
import { CancelError } from "@nan0web/ui"

/** @typedef {import("./select.js").ConsoleLike} ConsoleLike */
/** @typedef {(input: Input) => Promise<boolean>} LoopFn */
/** @typedef {(input: Input) => string} NextQuestionFn */

/**
 * Input function.
 * ---
 * Must be used only as a type — typedef does not work with full arguments description for functions.
 * ---
 * @param {string} question - Prompt displayed to the user.
 * @param {boolean | LoopFn} [loop=false] - Loop‑control flag, validator or boolean that forces a single answer.
 * @param {string | NextQuestionFn} [nextQuestion] - When `false` the prompt ends after one answer.
 *                                            When a `function` is supplied it receives the current {@link Input}
 *                                            and must return a new question string for the next iteration.
 *
 * @returns {Promise<Input>} Resolves with an {@link Input} instance that contains the final answer,
 *                           the raw value and cancellation state.
 *
 * @throws {Error} May propagate errors from the underlying readline interface.
 */
export async function InputFn(question, loop = false, nextQuestion = undefined) {
	return new Input()
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
 * Low‑level prompt that returns a trimmed string.
 *
 * @param {Object} input
 * @param {string} input.question - Text displayed as a prompt.
 * @param {string} [input.predef] - Optional predefined answer (useful for testing).
 * @param {ConsoleLike} [input.console] - Optional console to show predefined value
 * @param {import("node:readline").Interface} [input.rl] - Readline interface instnace
 * @returns {Promise<string>} The answer without surrounding whitespace.
 *
 * When `predef` is supplied the function mimics the usual readline output
 * (`question + answer + newline`) and returns the trimmed value.
 */
export async function _askRaw(input) {
	const {
		question,
		predef = undefined,
		console,
		rl: initialRL,
	} = input
	// Fast‑path for predefined answers – mimic readline output.
	if (typeof predef === "string") {
		if (console) {
			console.info(`${question}${predef}\n`)
		} else {
			process.stdout.write(`${question}${predef}\n`)
		}
		return predef.trim()
	}

	return new Promise(resolve => {
		const rl = initialRL ?? createInterface({ input: stdin, output: stdout, terminal: true })
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
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {ConsoleLike} [console] Optional console instance.
 * @returns {InputFn} Async function that resolves to an {@link Input}.
 */
export function createInput(stops = [], predef = undefined, console = undefined) {
	const input = new Input({ stops })

	/**
	 * Internal handler used by the factory.
	 *
	 * @param {string} question - Prompt displayed to the user.
	 * @param {boolean | LoopFn} [loop=false] - Loop‑control flag or validator.
	 * @param {string | NextQuestionFn} [nextQuestion=false] - Next prompt generator or its value.
	 * @returns {Promise<Input>}
	 */
	async function fn(question, loop = false, nextQuestion = undefined) {
		let currentQuestion = question
		while (true) {
			input.value = await _askRaw({ question: currentQuestion, predef, console })

			if (false === loop || input.cancelled) return input
			if (true === loop && input.value) return input
			if (typeof loop === "function") {
				const cont = await loop(input)
				if (!cont) return input
			}
			if (typeof nextQuestion === "string") currentQuestion = nextQuestion
			if (typeof nextQuestion === "function") currentQuestion = nextQuestion(input)
		}
	}
	return fn
}

/**
 * High‑level input helper `ask`.
 *
 * This constant inherits the full {@link InputFn} signature **and** the
 * detailed JSDoc description for each argument, as defined in {@link InputFn}.
 *
 * @type {InputFn}
 */
export const ask = createInput()

/**
 * @param {string[]} predefined
 * @param {ConsoleLike} console
 * @param {string[]} [stops=[]]
 * @returns {import("./select.js").InputFn}
 * @throws {CancelError}
 */
export function createPredefinedInput(predefined, console, stops = []) {
	const strPredefined = predefined.map(String)
	const input = new Input({ stops })
	let index = 0
	return async function predefinedHandler(question, loop = false, nextQuestion = undefined) {
		let currentQuestion = question
		while (true) {
			if (index >= strPredefined.length) {
				throw new CancelError("No more predefined answers")
			}
			const predef = strPredefined[index++]
			if (console) {
				console.info(`${currentQuestion}${predef}\n`)
			} else {
				process.stdout.write(`${currentQuestion}${predef}\n`)
			}
			input.value = predef.trim()
			if (input.cancelled) {
				return input
			}
			if (false === loop) {
				return input
			}
			if (true === loop && input.value) {
				return input
			}
			if (typeof loop === "function") {
				const cont = await loop(input)
				if (!cont) {
					return input
				}
			}
			if (typeof nextQuestion === "string") {
				currentQuestion = nextQuestion
			} else if (typeof nextQuestion === "function") {
				currentQuestion = nextQuestion(input)
			}
		}
	}
}

export default createInput