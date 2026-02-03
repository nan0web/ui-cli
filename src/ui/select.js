/**
 * Select module – renders a numbered list of options and returns the chosen value.
 *
 * @module ui/select
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * Configuration object for {@link select}.
 *
 * @param {Object} input
 * @param {string} input.title - Title displayed above the options list.
 * @param {string} [input.prompt] - Prompt displayed for the answer.
 * @param {Array|Map} input.options - Collection of selectable items.
 * @param {Object} [input.console] - Deprecated. Ignored in new implementation.
 * @param {string[]} [input.stops=[]] - Deprecated. Ignored in new implementation.
 * @param {any} [input.ask] - Deprecated. Ignored in new implementation.
 * @param {string} [input.invalidPrompt] - Deprecated. Ignored in new implementation.
 * @param {number} [input.limit=10] - Max visible items.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>} Resolves with the selected index and its value.
 *
 * @throws {CancelError} When the user cancels the operation.
 */
export async function select(input) {
	const {
		title,
		prompt,
		options: initOptins,
		limit = 10,
	} = input

	let options = initOptins

	// Normalise Map → Array of {label,value}
	if (options instanceof Map) {
		options = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
	}
	if (!Array.isArray(options) || options.length === 0) {
		throw new Error('Options array is required and must not be empty')
	}
	// Prepare options for prompts
	const choices = options.map((el) => {
		if (typeof el === 'string') {
			return { title: el, value: el }
		}
		return { title: el.label, value: el.value }
	})

	const response = await prompts({
		type: 'select',
		name: 'value',
		message: title ? title : prompt,
		choices: choices,
		hint: prompt && title ? prompt : undefined,
		limit
	}, {
		onCancel: () => {
			throw new CancelError()
		}
	})

	const index = choices.findIndex(c => c.value === response.value)

	return { index, value: response.value, cancelled: false }
}

/**
 * Default export for convenience.
 *
 * @type {typeof select}
 */
export default select
