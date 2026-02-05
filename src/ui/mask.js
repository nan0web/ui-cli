/**
 * Mask module – provides formatted input handling.
 *
 * @module ui/mask
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import { beep } from './input.js'

/**
 * Validates and optionally formats user input based on a pattern.
 * Pattern uses '#' for numbers and 'A' for letters.
 * Example: '(###) ###-####'
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '###-###')
 * @param {string} [config.placeholder] - Hint for the user
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
/**
 * Cleans the input value by stripping non-alphanumerics and smart prefix.
 */
export function cleanMaskInput(value, mask) {
	let cleanValue = value.toString().replace(/[^a-zA-Z0-9]/g, '')

	// Smart Prefix Detection:
	// If the user typed the mask's static prefix (e.g. '38' for '+38'),
	// remove it from the input to prevent duplication.
	const firstPlaceholderIndex = mask.search(/[#0A]/)
	if (firstPlaceholderIndex > 0) {
		const maskPrefix = mask.substring(0, firstPlaceholderIndex).replace(/[^a-zA-Z0-9]/g, '')
		if (maskPrefix && cleanValue.startsWith(maskPrefix)) {
			// Special Check: If the user typed ONLY the prefix so far, don't strip it yet?
			// Actually, removing it is safer to avoid "Format must be: +38 (38)" error midway?
			// But for full validation, we strip it.
			cleanValue = cleanValue.substring(maskPrefix.length)
		}
	}
	return cleanValue
}

/**
 * Formats a value according to the given mask.
 * pattern: # = digit, A = letter, 0 = digit.
 *
 * @param {string} value
 * @param {string} mask
 * @returns {string}
 */
export function formatMask(value, mask) {
	let i = 0
	let v = 0
	let result = ''

	const cleanValue = cleanMaskInput(value, mask)

	while (i < mask.length && v < cleanValue.length) {
		const maskChar = mask[i]
		if (maskChar === '#' || maskChar === '0' || maskChar === 'A') {
			result += cleanValue[v]
			v++
		} else {
			result += maskChar
		}
		i++
	}
	return result
}

export async function mask(config) {
	const { message, mask, placeholder, t } = config

	const validate = (val) => {
		if (!val) {
			beep()
			return 'Input is required'
		}

		// Support '#', '0' for numbers and 'A' for letters.
		const cleanMask = mask.replace(/[^#0A]/g, '')
		const cleanVal = cleanMaskInput(val, mask)

		if (cleanVal.length !== cleanMask.length) {
			beep()
			return `${config.t ? config.t('Format must be:') : 'Format must be:'} ${mask}`
		}

		return true
	}

	/*
	 */

	// Pre-format the placeholder if it exists so the default value is visual
	const initialValue = placeholder ? formatMask(placeholder, mask) : undefined

	const response = await prompts({
		type: 'text',
		name: 'value',
		message,
		initial: initialValue,
		validate,
		format: (val) => formatMask(val, mask)
	}, {
		onCancel: () => {
			throw new CancelError()
		}
	})

	// Ensure the returned value is always formatted
	const formatted = formatMask(response.value, mask)

	// Manual Stdout Override:
	// prompts library might verify correctly but display raw input on the final line in some environments.
	// We force a clean UI by removing the last line and printing our own.
	if (process.stdout.isTTY) {
		process.stdout.moveCursor(0, -1) // Move up one line
		process.stdout.clearLine(0)      // Clear the line
		// Re-print the message and value manually with proper formatting
		// Note: We use '✔' to match prompts style, or we can use our own if desired.
		// prompts default style: '✔ Message … Value'
		console.log(`✔ ${message} … ${formatted}`)
	}

	return { value: formatted, cancelled: false }
}
