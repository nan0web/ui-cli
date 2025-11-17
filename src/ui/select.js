/**
 * Select module – renders a numbered list of options and returns the chosen value.
 *
 * @module ui/select
 */

import { CancelError } from "@nan0web/ui/core"
import createInput from "./input.js"

/** @typedef {import("./input.js").Input} Input */
/** @typedef {import("./input.js").InputFn} InputFn */

/**
 * @typedef {Object} ConsoleLike
 * @property {(...args: any[]) => void} debug
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 */

/**
 * Configuration object for {@link select}.
 *
 * @typedef {Object} SelectConfig
 * @property {string} title – Title displayed above the options list.
 * @property {string} prompt – Prompt displayed for the answer.
 * @property {Array|Map} options – Collection of selectable items.
 * @property {ConsoleLike} console – Console‑like object with an `info` method.
 * @property {string[]} [stops=[]] Words that trigger cancellation.
 * @property {InputFn} [ask] Custom ask function (defaults to {@link createInput}).
 * @property {string} [invalidPrompt="Invalid choice, try again: "] Message shown on invalid input.
 *
 * @returns {Promise<{index:number,value:any}>} Resolves with the selected index and its value.
 *
 * @throws {CancelError} When the user cancels the operation.
 * @throws {Error} When options are missing or an incorrect value is supplied and no
 *   `invalidPrompt` is defined.
 */
export async function select({
	title,
	prompt,
	invalidPrompt = "Invalid choice, try again: ",
	options,
	console,
	stops = [],
	ask: initAsk,
}) {
	/** @type {InputFn} */
	const ask = initAsk ?? createInput(stops)

	// Normalise Map → Array of {label,value}
	if (options instanceof Map) {
		options = Array.from(options.entries()).map(
			([value, label]) => ({ label, value }))
	}
	if (!Array.isArray(options) || options.length === 0) {
		throw new Error("Options array is required and must not be empty")
	}
	const list = options.map(el =>
		typeof el === "string" ? { label: el, value: el } : el,
	)

	console.info(title)
	list.forEach(({ label }, i) => console.info(` ${i + 1}) ${label}`))

	/**
	 * Validation function passed to `ask` as the *loop* argument.
	 * @type {import("./input.js").LoopFn}
	 */
	const validator = async (input) => {
		if (input.cancelled) {
			throw new CancelError()
		}
		const idx = Number(input.value) - 1
		if (isNaN(idx) || idx < 0 || idx >= list.length) {
			if (invalidPrompt) {
				return true // repeat asking
			}
			throw new Error("Incorrect value provided")
		}
		// valid selection – store index for later return
		// we reuse `idx` after ask resolves
		return false // stop looping
	}

	// Ask with validator loop; when validator returns false we have a valid answer.
	const answer = await ask(prompt, validator, invalidPrompt)

	// After validator passes, compute the final index once more (safe)
	const finalIdx = Number(answer.value) - 1
	return { index: finalIdx, value: list[finalIdx].value }
}

/**
 * Default export for convenience.
 *
 * @type {typeof select}
 */
export default select
