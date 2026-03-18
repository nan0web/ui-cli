#!/usr/bin/env node
/**
 * i18n Inspector — Zero-Hallucination i18n Translation & Keys Validator
 *
 * Scans source files for t('...') calls and validates all translation keys
 * exist in every vocabulary file. Outputs structured JSON per /i18n-inspector.
 *
 * Exit codes:
 * - 0: All translations present
 * - 1: Missing translations found
 *
 * @module scripts/check-i18n
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'src')
const VOCABS_DIR = join(ROOT, 'play', 'vocabs')

// Regex to extract translation keys from t('...') or t("...")
const T_CALL_REGEX = /\bt\(['"]([^'"]+)['"]\)/g

/**
 * Recursively find all .js files in a directory
 * @param {string} dir
 * @param {string[]} files
 * @returns {Promise<string[]>}
 */
async function findJsFiles(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = join(dir, entry.name)

		if (entry.isDirectory()) {
			await findJsFiles(fullPath, files)
		} else if (entry.isFile() && entry.name.endsWith('.js')) {
			files.push(fullPath)
		}
	}

	return files
}

/**
 * Extract all translation keys from a file
 * @param {string} filePath
 * @returns {Promise<Set<string>>}
 */
async function extractKeysFromFile(filePath) {
	const content = await readFile(filePath, 'utf-8')
	const keys = new Set()

	let match
	while ((match = T_CALL_REGEX.exec(content)) !== null) {
		keys.add(match[1])
	}

	return keys
}

/**
 * Load vocabulary from a vocab file
 * @param {string} vocabPath
 * @returns {Promise<Record<string, string>>}
 */
async function loadVocab(vocabPath) {
	try {
		const module = await import(vocabPath)
		return module.default || module
	} catch (/** @type {any} */ error) {
		console.error(`❌ Failed to load vocab from ${vocabPath}:`, error.message)
		return {}
	}
}

/**
 * Main checker logic — outputs structured JSON per /i18n-inspector contract
 */
async function main() {
	const isJSON = process.argv.includes('--json')

	// 1. Find all source files
	const sourceFiles = await findJsFiles(SRC_DIR)

	// 2. Extract all unique translation keys
	const allKeys = new Set()
	for (const file of sourceFiles) {
		const keys = await extractKeysFromFile(file)
		keys.forEach((key) => allKeys.add(key))
	}

	// 3. Find all vocab files
	const vocabFiles = (await findJsFiles(VOCABS_DIR)).filter((f) => !f.endsWith('index.js'))

	// 4. Check each vocab file and build report
	/** @type {Array<{locale: string, keys_found: number, translations: Record<string, string>, missing: string[], warnings: string[]}>} */
	const reports = []
	let hasErrors = false

	for (const vocabFile of vocabFiles) {
		const locale = relative(VOCABS_DIR, vocabFile).replace('.js', '')
		const vocab = await loadVocab(vocabFile)
		const vocabKeys = new Set(Object.keys(vocab))
		const missing = [...allKeys].filter((key) => !vocabKeys.has(key))
		const unused = [...vocabKeys].filter((key) => !allKeys.has(key))

		const warnings = []
		if (unused.length > 0) {
			warnings.push(
				`${unused.length} key(s) in vocab but not in source (may be used in play/ demos)`
			)
		}

		if (missing.length > 0) hasErrors = true

		reports.push({
			locale,
			keys_found: vocabKeys.size,
			translations: vocab,
			missing,
			warnings,
		})
	}

	// 5. Output
	if (isJSON) {
		// Structured JSON output per /i18n-inspector contract
		const result = {
			source_keys: allKeys.size,
			source_files: sourceFiles.length,
			locales: reports.map((r) => ({
				locale: r.locale,
				keys_found: r.keys_found,
				missing: r.missing,
				warnings: r.warnings,
			})),
			ok: !hasErrors,
		}
		console.log(JSON.stringify(result, null, 2))
	} else {
		// Human-readable output
		console.log('🔍 Scanning source files for translation keys...\n')
		console.log(`📂 Found ${sourceFiles.length} source files in src/`)
		console.log(`🔑 Found ${allKeys.size} unique translation keys\n`)

		if (allKeys.size === 0) {
			console.log('✅ No translation keys found (nothing to check)')
			return
		}

		console.log(
			`📚 Checking vocabularies: ${vocabFiles.map((f) => relative(ROOT, f)).join(', ')}\n`
		)

		for (const r of reports) {
			if (r.missing.length > 0) {
				console.log(`❌ ${r.locale}: Missing ${r.missing.length} translation(s):`)
				r.missing.forEach((key) => console.log(`   - "${key}"`))
				console.log()
			} else {
				console.log(`✅ ${r.locale}: All ${allKeys.size} keys present`)
			}
		}

		console.log('\n' + '='.repeat(60))
		if (hasErrors) {
			console.log('❌ I18n check FAILED: Missing translations detected')
			console.log('='.repeat(60))
		} else {
			console.log('✅ I18n check PASSED: All translations complete')
			console.log('='.repeat(60))
		}
	}

	if (hasErrors) process.exit(1)
}

main().catch((error) => {
	console.error('💥 Fatal error:', error)
	process.exit(1)
})
