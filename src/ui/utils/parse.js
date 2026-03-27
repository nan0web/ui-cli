/**
 * Utility functions for parsing command‑line strings.
 *
 * @module utils/parse
 */

/**
 * Parses a string into an argv array (handles quotes).
 *
 * @param {string} str - Raw command line.
 * @returns {string[]} Tokenized arguments.
 * @throws {Error} If a quote is left unmatched.
 */
export function str2argv(str) {
	const parts = []
	let i = 0
	str = String(str).trim()

	while (i < str.length) {
		while (i < str.length && str[i] === ' ') i++
		if (i >= str.length) break

		if (str[i] === '"' || str[i] === "'") {
			const quote = str[i]
			i++
			let start = i
			while (i < str.length && str[i] !== quote) i++
			if (i < str.length) {
				parts.push(str.slice(start, i))
				i++
			} else {
				throw new Error(`Unmatched quote in argument: ${str}`)
			}
		} else {
			let start = i
			while (i < str.length && str[i] !== ' ') i++
			parts.push(str.slice(start, i))
		}
	}
	return parts
}
