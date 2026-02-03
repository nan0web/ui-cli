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

	/*
	 * Helper helper to format value according to mask
	 */
	const applyMask = (value) => {
		let i = 0
		let v = 0
		let result = ''
		const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '')

		while (i < mask.length && v < cleanValue.length) {
			const maskChar = mask[i]
			if (maskChar === '#' || maskChar === 'A') {
				result += cleanValue[v]
				v++
			} else {
				result += maskChar
				if (v < cleanValue.length && value[result.length - 1] === maskChar) {
					// if user typed the separator, skip it in source too logic already handled by cleanValue
				}
			}
			i++
		}
		// append remaining mask suffix if any non-input chars left? No, usually not for partial input but here we assume full input
		return result
	}

	const result = await text({
		message: `${message} (${mask})`,
		initial: placeholder,
		validate,
		format: (val) => {
			// Apply mask formatting on submit
			return applyMask(val)
		}
	})

	return result
}

