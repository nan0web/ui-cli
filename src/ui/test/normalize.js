/**
 * Universal Snapshot Output Normalizer.
 *
 * Provides reusable CLI output normalization for snapshot comparison.
 * Each component can declare its own `snapshotReplacements` static property
 * to describe how its non-deterministic output should be stabilized.
 *
 * @module test/normalize
 */

/** Базові ANSI-заміни — завжди застосовуються */
const ANSI = [
	{ pattern: /\x1B\[[0-9;?]*[a-zA-Z]/g, replacement: '' },
	{ pattern: /^\s+/, replacement: '' },
]

/** Tree icon replacements — frequently duplicated across projects */
export const TREE_REPLACEMENTS = [
	{ pattern: /📁/g, replacement: '[D]' },
	{ pattern: /📄/g, replacement: '[F]' },
	{ pattern: /▼/g, replacement: 'v' },
	{ pattern: /▶/g, replacement: '>' },
	{ pattern: /◉/g, replacement: '(x)' },
	{ pattern: /◯/g, replacement: '( )' },
	{ pattern: /[\u2800-\u28FF]/g, replacement: '*' },
]

/**
 * Нормалізує CLI вивід для snapshot порівняння.
 *
 * @param {string} str — сирий stdout/stderr
 * @param {Array<{pattern: RegExp, replacement?: string}>} [replacements=[]]
 * @returns {string}
 */
export function normalize(str, replacements = []) {
	let result = str
	for (const { pattern, replacement } of [...ANSI, ...replacements]) {
		result = result.replace(pattern, replacement ?? '')
	}
	return result.trim()
}

/**
 * Збирає snapshotReplacements з усіх переданих компонентів.
 * Компоненти без `snapshotReplacements` ігноруються.
 *
 * @param {...any} components
 * @returns {Array<{pattern: RegExp, replacement?: string}>}
 */
export function collectReplacements(...components) {
	return components
		.filter((c) => c != null && Array.isArray(c.snapshotReplacements))
		.flatMap((c) => c.snapshotReplacements)
}
