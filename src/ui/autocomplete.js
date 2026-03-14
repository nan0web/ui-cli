/**
 * Autocomplete module - provides a searchable selection list.
 *
 * @module ui/autocomplete
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import Logger from '@nan0web/log'

let _lastQuery = ''
let _lastRegex = null

/**
 * Highlights the matching part of the text based on the query.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
function highlight(text, query) {
	if (!query) return text
	if (query !== _lastQuery) {
		_lastQuery = query
		_lastRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
	}
	return text.replace(_lastRegex, `${Logger.MAGENTA}$1${Logger.RESET}`)
}

/**
 * Renders a searchable selection list.
 *
 * @param {Object} input
 * @param {string} [input.message] - Prompt message.
 * @param {string} [input.title] - Alternative prompt title.
 * @param {Array|Function} input.options - List of options or async function to fetch them.
 * @param {number} [input.limit=10] - Max visible items.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>}
 */
export async function autocomplete(input) {
	const { message, title, options: initOptions, limit = 30 } = input

	let choices = []
	const fetchSync = (query = '') => {
		let currentOptions = typeof initOptions === 'function' ? [] : initOptions

		// Filter
		const filtered = currentOptions.filter((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label || ''
			return label.toLowerCase().includes(query.toLowerCase())
		})

		return filtered.map((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label
			const value = typeof el === 'string' ? el : el.value
			return {
				title: highlight(label, query),
				value: value,
			}
		})
	}

	const fetch = async (query = '') => {
		if (typeof initOptions !== 'function') return fetchSync(query)

		let currentOptions = await initOptions(query)

		// Normalize Map or Array
		if (currentOptions instanceof Map) {
			currentOptions = Array.from(currentOptions.entries()).map(([value, label]) => ({
				label,
				value,
			}))
		}

		const filtered = currentOptions.filter((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label || ''
			return label.toLowerCase().includes(query.toLowerCase())
		})

		return filtered.map((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label
			const value = typeof el === 'string' ? el : el.value
			return {
				title: highlight(label, query),
				value: value,
			}
		})
	}

	choices = typeof initOptions === 'function' ? await fetch('') : fetchSync('')

	const response = await prompts(
		{
			type: 'autocomplete',
			name: 'value',
			message: message || title,
			limit,
			choices: choices,
			suggest: (input, choices) =>
				typeof initOptions === 'function' ? fetch(input) : fetchSync(input),
		},
		{
			onCancel: () => {
				throw new CancelError()
			},
		}
	)

	const finalChoices = typeof initOptions === 'function' ? await fetch('') : fetchSync('')
	const index = finalChoices.findIndex((c) => c.value === response.value)

	return { index, value: response.value, cancelled: response.value === undefined }
}
