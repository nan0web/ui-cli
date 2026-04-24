/**
 * Autocomplete module - provides a searchable selection list.
 *
 * @module ui/autocomplete
 */

import prompts from './prompts.js'
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

	// In test mode with PLAY_DEMO_SEQUENCE, simulate input
	const isTest = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE
	const isSnapshot = !!process.env.UI_SNAPSHOT

	const fetchSync = (query = '') => {
		let currentOptions = typeof initOptions === 'function' ? [] : initOptions
		const filtered = currentOptions.filter((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label || ''
			return label.toLowerCase().includes(query.toLowerCase())
		})
		return filtered.map((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label
			const value = typeof el === 'string' ? el : el.value
			return { title: highlight(label, query), value }
		})
	}

	const fetch = async (query = '') => {
		if (typeof initOptions !== 'function') return fetchSync(query)
		let currentOptions = await initOptions(query)
		if (currentOptions instanceof Map) {
			currentOptions = Array.from(currentOptions.entries()).map(([value, label]) => ({ label, value }))
		}
		const filtered = currentOptions.filter((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label || ''
			return label.toLowerCase().includes(query.toLowerCase())
		})
		return filtered.map((el) => {
			const label = typeof el === 'string' ? el : el.title || el.label
			const value = typeof el === 'string' ? el : el.value
			return { title: highlight(label, query), value }
		})
	}

	if (isTest || isSnapshot) {
		if (prompts._injected && prompts._injected.length > 0) {
			const predefined = prompts._injected.shift()
			if (predefined instanceof Error) throw new CancelError()

			if (isSnapshot && predefined !== null) {
				const logger = new Logger()
				const prompt = message || title || 'Search: '
				const frames = []
				const p = String(predefined)
				if (p.length > 1) frames.push(p.charAt(0))
				if (p.length > 2) frames.push(p.slice(0, 2))
				frames.push(p)

				for (let i = 0; i < frames.length; i++) {
					const text = frames[i]
					logger.info(`${prompt} ${text}`)
					try {
						const list = await fetch(text)
						list.slice(0, limit).forEach((item) => {
							logger.info(`  ${typeof item === 'string' ? item : item.title || item.label || item.value}`)
						})
					} catch (e) {}

					if (i < frames.length - 1) {
						logger.info('\n[SNAPSHOT_FRAME]\n')
						await new Promise((r) => setTimeout(r, 200))
					}
				}
			}

			return { value: predefined, index: 0, cancelled: false }
		}
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
