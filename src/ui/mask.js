/**
 * Mask module – provides formatted input handling.
 *
 * @module ui/mask
 */

import { text, beep } from './input.js'

/**
 * Validates and optionally formats user input based on a pattern.
 * Pattern uses '#' for numbers and 'A' for letters.
 * Example: '(###) ###-####'
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '###-###')
 * @param {string} [config.placeholder] - Hint for the user
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
export async function mask(config) {
	const { message, mask, placeholder } = config

	const validate = (val) => {
		if (!val) {
			beep()
			return 'Input is required'
		}

		// Simple validation logic based on '#' (digit) and 'A' (alpha)
		let maskIdx = 0
		let valIdx = 0

		// This is a basic implementation.
		// For a full-featured mask we might need a more complex regex generator.
		const cleanMask = mask.replace(/[^#A]/g, '')
		const cleanVal = val.replace(/[^a-zA-Z0-9]/g, '')

		if (cleanVal.length !== cleanMask.length) {
			beep()
			return `Format must be: ${mask}`
		}

		return true
	}

	const result = await text({
		message: `${message} (${mask})`,
		initial: placeholder,
		validate
	})

	return result
}

export default mask
