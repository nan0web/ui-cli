/**
 * Release v2.4.0 — Universal Snapshot Output Normalizer
 * Contract tests: кожен пункт ТЗ = тест.
 * Цей файл НЕ модифікується під час реалізації.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('v2.4.0 — Universal Snapshot Output Normalizer', () => {
	// ─────────────────────────────────────────────────────────
	// 1. Core normalize() function
	// ─────────────────────────────────────────────────────────

	it('normalize() strips ANSI escape codes', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const input = '\x1B[31mRed text\x1B[0m normal'
		const result = normalize(input)
		assert.equal(result, 'Red text normal')
	})

	it('normalize() strips leading whitespace', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const input = '   \n  Hello World  '
		const result = normalize(input)
		assert.equal(result, 'Hello World')
	})

	it('normalize() applies custom replacements', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const input = 'Duration: 42s elapsed'
		const replacements = [{ pattern: /\d+s/, replacement: '[TIME]' }]
		const result = normalize(input, replacements)
		assert.equal(result, 'Duration: [TIME] elapsed')
	})

	it('normalize() returns empty string for empty input', async () => {
		const { normalize } = await import('../../../../normalize.js')
		assert.equal(normalize(''), '')
		assert.equal(normalize('   '), '')
	})

	// ─────────────────────────────────────────────────────────
	// 2. Spinner.snapshotReplacements
	// ─────────────────────────────────────────────────────────

	it('Spinner has snapshotReplacements static property', async () => {
		const { Spinner } = await import('../../../../../ui/spinner.js')
		assert.ok(Array.isArray(Spinner.snapshotReplacements), 'snapshotReplacements must be an array')
		assert.ok(Spinner.snapshotReplacements.length > 0, 'snapshotReplacements must not be empty')
	})

	it('Spinner.snapshotReplacements normalizes spinner frames', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const { Spinner } = await import('../../../../../ui/spinner.js')
		const input = '⠋ Loading...\n⠙ Loading...\n⠹ Loading...'
		const result = normalize(input, Spinner.snapshotReplacements)
		assert.ok(result.includes('[SPINNER]'), `Expected [SPINNER] in: ${result}`)
		// Deduplicated — should not have multiple consecutive [SPINNER] lines
		assert.ok(
			!result.includes('[SPINNER]\n[SPINNER]'),
			'Consecutive spinner frames should be deduplicated'
		)
	})

	it('Spinner.snapshotReplacements normalizes time durations', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const { Spinner } = await import('../../../../../ui/spinner.js')
		const input = 'Done [00:42]'
		const result = normalize(input, Spinner.snapshotReplacements)
		assert.ok(result.includes('[XX:XX]'), `Expected [XX:XX] in: ${result}`)
	})

	// ─────────────────────────────────────────────────────────
	// 3. ProgressBar.snapshotReplacements
	// ─────────────────────────────────────────────────────────

	it('ProgressBar has snapshotReplacements static property', async () => {
		const { ProgressBar } = await import('../../../../../ui/progress.js')
		assert.ok(
			Array.isArray(ProgressBar.snapshotReplacements),
			'snapshotReplacements must be an array'
		)
		assert.ok(
			ProgressBar.snapshotReplacements.length > 0,
			'snapshotReplacements must not be empty'
		)
	})

	it('ProgressBar.snapshotReplacements normalizes progress bar output', async () => {
		const { normalize } = await import('../../../../normalize.js')
		const { ProgressBar } = await import('../../../../../ui/progress.js')
		const input = '[=======>----] 50% [00:05 < 00:05]'
		const result = normalize(input, ProgressBar.snapshotReplacements)
		assert.ok(result.includes('[PROGRESS]'), `Expected [PROGRESS] in: ${result}`)
	})

	// ─────────────────────────────────────────────────────────
	// 4. collectReplacements()
	// ─────────────────────────────────────────────────────────

	it('collectReplacements() merges replacements from multiple components', async () => {
		const { collectReplacements } = await import('../../../../normalize.js')
		const { Spinner } = await import('../../../../../ui/spinner.js')
		const { ProgressBar } = await import('../../../../../ui/progress.js')
		const result = collectReplacements(Spinner, ProgressBar)
		assert.ok(Array.isArray(result))
		assert.ok(
			result.length >= Spinner.snapshotReplacements.length + ProgressBar.snapshotReplacements.length,
			`Expected at least ${Spinner.snapshotReplacements.length + ProgressBar.snapshotReplacements.length} rules, got ${result.length}`
		)
	})

	it('collectReplacements() ignores components without snapshotReplacements', async () => {
		const { collectReplacements } = await import('../../../../normalize.js')
		const { Spinner } = await import('../../../../../ui/spinner.js')
		const result = collectReplacements(Spinner, {}, null, undefined)
		assert.ok(Array.isArray(result))
		assert.equal(result.length, Spinner.snapshotReplacements.length)
	})

	// ─────────────────────────────────────────────────────────
	// 5. Sub-path export
	// ─────────────────────────────────────────────────────────

	it('normalize and collectReplacements are exported from @nan0web/ui-cli/test', async () => {
		const testExports = await import('../../../../index.js')
		assert.equal(typeof testExports.normalize, 'function', 'normalize must be exported')
		assert.equal(
			typeof testExports.collectReplacements,
			'function',
			'collectReplacements must be exported'
		)
	})

	// ─────────────────────────────────────────────────────────
	// 6. Tree normalizer (bonus — also frequently duplicated)
	// ─────────────────────────────────────────────────────────

	it('Tree icons can be normalized via TREE_REPLACEMENTS', async () => {
		const { TREE_REPLACEMENTS, normalize } = await import('../../../../normalize.js')
		const input = '📁 src\n  📄 index.js\n  ▼ components\n  ▶ utils'
		const result = normalize(input, TREE_REPLACEMENTS)
		assert.ok(result.includes('[D]'), 'Folder icons should be replaced with [D]')
		assert.ok(result.includes('[F]'), 'File icons should be replaced with [F]')
		assert.ok(result.includes('v '), 'Expanded arrow ▼ should become v')
		assert.ok(result.includes('> '), 'Collapsed arrow ▶ should become >')
	})
})
