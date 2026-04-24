/**
 * Multiselect module – provides interactive multiple-choice selection list.
 *
 * @module ui/multiselect
 */

import prompts from './prompts.js'
import { CancelError } from '@nan0web/ui/core'
import Logger from '@nan0web/log'

/**
 * Interactive multiple selection with checkboxes.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {Array<string|Object>} config.options - List of choices
 * @param {number} [config.limit=10] - Visible items limit
 * @param {Array<any>} [config.initial=[]] - Initial selected values
 * @param {string|boolean} [config.instructions] - Custom instructions
 * @param {string} [config.hint] - Navigation hint
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: Array<any>|undefined, cancelled: boolean}>}
 */
export async function multiselect(config) {
	const { message, options, limit = 10, initial = [], t } = config

	// In test mode with PLAY_DEMO_SEQUENCE, simulate input
	const isTest = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE
	const isSnapshot = !!process.env.UI_SNAPSHOT

	if (isTest || isSnapshot) {
		if (prompts._injected && prompts._injected.length > 0) {
			const predefined = prompts._injected.shift()
			if (predefined instanceof Error) throw new CancelError()
			if (predefined === '_cancel') return { value: undefined, cancelled: true }

			const values = String(predefined).split(',').map((v) => v.trim())
			return { value: values, cancelled: false }
		}
	}

	if (!Array.isArray(options) || options.length === 0) {
		throw new Error('Options array is required and must not be empty')
	}

	const choices = options.map((el) => {
		if (typeof el === 'string') {
			return { title: el, value: el, selected: initial.includes(el) }
		}
		return {
			title: el.label || el.title,
			value: el.value,
			selected: initial.includes(el.value),
		}
	})

	const response = await prompts(
		{
			type: 'multiselect',
			name: 'value',
			message,
			choices,
			limit,
			instructions: config.instructions !== undefined ? config.instructions : false,
			hint: config.hint || '',
		},
		{
			onCancel: () => {
				throw new CancelError()
			},
		}
	)

	return { value: response.value || [], cancelled: false }
}
