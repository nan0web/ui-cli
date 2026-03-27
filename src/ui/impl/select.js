/**
 * Select module – renders a numbered list of options and returns the chosen value.
 *
 * @module ui/select
 */

import prompts from './prompts.js'
import { CancelError } from '@nan0web/ui/core'
import { validateString, validateFunction, validateNumber } from '../core/PropValidation.js'

/**
 * Configuration object for {@link select}.
 *
 * @param {Object} input
 * @param {string} input.title - Title displayed above the options list.
 * @param {string} [input.prompt] - Prompt displayed for the answer.
 * @param {string} [input.message] - Alternative title field.
 * @param {string} [input.label] - Alternative title field.
 * @param {Array|Map} input.options - Collection of selectable items.
 * @param {Object} [input.console] - Deprecated. Ignored in new implementation.
 * @param {string[]} [input.stops=[]] - Deprecated. Ignored in new implementation.
 * @param {any} [input.ask] - Deprecated. Ignored in new implementation.
 * @param {string} [input.invalidPrompt] - Deprecated. Ignored in new implementation.
 * @param {number} [input.limit=10] - Max visible items.
 * @param {any} [input.initial] - Initial value or index.
 * @param {string} [input.hint] - Hint text.
 * @param {boolean} [input.hotkeys=false] - Support entering single chars directly.
 * @param {Function} [input.t] - Translation function.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>} Resolves with the selected index and its value.
 *
 * @throws {CancelError} When the user cancels the operation.
 */
export async function select(input) {
	const { title, prompt, message, label, options: initOptins, limit = 30, initial } = input

	// Prop Validation
	const displayTitle = title || prompt || message || label
	validateString(displayTitle, 'title', 'Select', true)
	validateNumber(limit, 'limit', 'Select')
	validateFunction(input.t, 't', 'Select')
	validateString(input.hint, 'hint', 'Select')

	let options = initOptins

	// Normalise Map → Array of {label,value}
	if (options instanceof Map) {
		options = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
	}
	if (!Array.isArray(options) || options.length === 0) {
		throw new Error('Options array is required and must not be empty')
	}
	const t = input.t || ((k) => k)
	const choices = options.map((el) => {
		if (typeof el === 'string') {
			return { title: t(el), value: el }
		}
		const titleStr = el.label || el.title || el.name
		const descStr = el.description || el.desc || el.help
		return {
			title: titleStr ? t(titleStr) : '',
			value: el.value,
			description: descStr ? t(descStr) : undefined,
		}
	})

	// If hotkeys enabled, return immediately on matching key
	let handler
	if (input.hotkeys) {
		handler = (str, key) => {
			if (!str || key.ctrl || key.meta) return
			const k = str.toLowerCase()
			const match = choices.find((c) => {
				const label = String(c.title).toLowerCase()
				// Match [X] pattern or first letter
				const bracketMatch = label.match(/\[([a-z0-9])\]/)
				if (bracketMatch && bracketMatch[1] === k) return true
				return label.startsWith(k)
			})
			if (match) {
				prompts.inject([match.value])
			}
		}
		process.stdin.on('keypress', handler)
	}

	try {
		const response = await prompts(
			{
				type: 'select',
				name: 'value',
				message: displayTitle,
				choices: choices,
				initial: (() => {
					const idx =
						typeof initial === 'number' ? initial : choices.findIndex((c) => c.value === initial)
					return idx >= 0 && idx < choices.length ? idx : 0
				})(),
				hint: input.hint || '',
				instructions: false,
				limit,
			},
			{
				onCancel: () => {
					throw new CancelError()
				},
			}
		)

		let index = choices.findIndex((c) => c.value === response.value)

		// If prompts returned an index (like 0) instead of the value, or value not found
		if (index === -1) {
			return { index: -1, value: undefined, cancelled: true }
		}

		return { index, value: response.value, cancelled: false }
	} finally {
		if (handler) {
			process.stdin.removeListener('keypress', handler)
		}
	}
}

/**
 * Default export for convenience.
 *
 * @type {typeof select}
 */
export default select
