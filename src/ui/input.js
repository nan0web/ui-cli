import { createInterface } from "node:readline"
import { stdin, stdout } from "node:process"

export class Input {
	value = ""
	stops = []
	#cancelled = false
	constructor(input = {}) {
		const {
			value = this.value,
			cancelled = this.#cancelled,
			stops = [],
		} = input
		this.value = String(value)
		this.stops = stops.map(String)
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
 * Helper to ask a question
 * @param {string} question
 */
export function ask(question) {
	return new Promise(resolve => {
		const rl = createInterface({ input: stdin, output: stdout, terminal: true })
		rl.question(question, answer => {
			rl.close()
			resolve(answer.trim())
		})
	})
}

export function createInput(stops = []) {
	const input = new Input({ stops })
	/**
	 * @param {string} question
	 * @param {Function | boolean} [loop=false]
	 * @param {Function | false} [nextQuestion=false]
	 * @returns {Promise<Input>}
	 */
	async function fn(question, loop = false, nextQuestion = false) {
		while (true) {
			input.value = await ask(question)
			if (false === loop || input.cancelled) return input
			if (true === loop && input.value) return input
			if ("function" === typeof loop) {
				if (!loop(input)) return input
			}
			if ("string" === typeof nextQuestion) question = nextQuestion
			if ("function" === typeof nextQuestion) question = nextQuestion(input)
		}
	}
	return fn
}

export default createInput
