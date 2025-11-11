/**
 * Select module – renders a numbered list of options and returns the chosen value.
 *
 * @module ui/select
 */

import { CancelError } from "@nan0web/ui/core"
import createInput, { ask as baseAsk } from "./input.js"

/**
 * Configuration object for {@link select}.
 *
 * @typedef {Object} SelectConfig
 * @property {string} title – Title displayed above the options list.
 * @property {string} prompt – Prompt displayed for the answer.
 * @property {Array|Map} options – Collection of selectable items.
 * @property {Object} console – Console‑like object with an `info` method.
 * @property {string[]} [stops=[]] Words that trigger cancellation.
 * @property {import("./input.js").InputFn} [ask] Custom ask function (defaults to {@link createInput}).
 * @property {string} [invalidPrompt="Invalid choice, try again: "] Message shown on invalid input.
 *
 * @returns {Promise<{index:number,value:any}>} Resolves with the selected index and its value.
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
	const ask = initAsk ?? createInput(stops)
	// Normalise Map → Array of {label,value}
	if (options instanceof Map) {
		options = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
	}
	if (!Array.isArray(options) || options.length === 0) {
		throw new Error("Options array is required and must not be empty")
	}
	const list = options.map(el =>
		typeof el === "string" ? { label: el, value: el } : el,
	)

	console.info(title)
	list.forEach(({ label }, i) => console.info(` ${i + 1}) ${label}`))

	let currentPrompt = prompt

	while (true) {
		const answer = await ask(currentPrompt)

		if (answer.cancelled) throw new CancelError()

		const idx = Number(answer.value) - 1

		if (isNaN(idx) || idx < 0 || idx >= list.length) {
			if (invalidPrompt) {
				currentPrompt = invalidPrompt
				continue
			}
			throw new Error("Incorrect value provided")
		}
		return { index: idx, value: list[idx].value }
	}
}

export default select
