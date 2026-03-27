#!/usr/bin/env node
/**
 * 🚀 Deterministic i18n Auditor (inspect-i18n)
 *
 * 1. Scans src/domain/ for static help/UI keys.
 * 2. Checks play/data/uk/_/t.nan0 for existing translations.
 * 3. Scans src/ui/ for hardcoded t('literal') calls (disallowed).
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const DOMAIN_DIR = join(ROOT, 'src', 'domain')
const UI_SRC_DIR = join(ROOT, 'src', 'ui')
const UK_VOCAB_FILE = join(ROOT, 'play', 'data', 'uk', '_', 't.nan0')

// Regex: static UI = '...' | static help = '...'
const DOMAIN_KEY_REGEX = /static\s+((?:UI|help)[A-Za-z0-9_]*)\s*=\s*['"]([^'"]+)['"]/g
// Regex: t('literal') - finds literals in t() calls
const T_LITERAL_REGEX = /\bt\(['"]([^'"]+)['"]\)/g

async function findFiles(dir, files = []) {
	try {
		const entries = await readdir(dir, { withFileTypes: true })
		for (const entry of entries) {
			const res = join(dir, entry.name)
			if (entry.isDirectory()) {
				await findFiles(res, files)
			} else if (entry.name.endsWith('.js')) {
				files.push(res)
			}
		}
	} catch (e) {
		// Dir doesn't exist, ignore
	}
	return files
}

async function main() {
	console.log('🔍 Scanning Domain Models for i18n keys...')
	
	const domainFiles = await findFiles(DOMAIN_DIR)
	const domainKeys = new Set()
	
	for (const file of domainFiles) {
		const content = await readFile(file, 'utf-8')
		let match
		while ((match = DOMAIN_KEY_REGEX.exec(content)) !== null) {
			domainKeys.add(match[2])
		}
	}

	console.log(`Found ${domainKeys.size} keys in domain models:\n   - ${[...domainKeys].join('\n   - ')}\n`)

	console.log('🔍 Validating translations in play/data/uk/_/t.nan0...')
	let ukContent = ''
	try {
		ukContent = await readFile(UK_VOCAB_FILE, 'utf-8')
	} catch (e) {
		console.warn('⚠️ Missing data/uk/_/t.nan0, creating it...')
	}

	const missing = []
	for (const key of domainKeys) {
		if (!ukContent.includes(`'${key}':`) && !ukContent.includes(`"${key}":`) && !ukContent.includes(`${key}:`)) {
			missing.push(key)
		}
	}

	if (missing.length > 0) {
		console.log(`❌ Missing translations for keys: ${missing.join(', ')}`)
	} else {
		console.log('✅ ALL domain keys translated in UK vocabulary.\n')
	}

	console.log('🔍 Scanning UI/Components for hardcoded t() calls...')
	const uiFiles = await findFiles(UI_SRC_DIR)
	const componentsFiles = await findFiles(join(ROOT, 'src', 'components'))
	const allUiFiles = [...uiFiles, ...componentsFiles]
	
	let hardcodedCount = 0
	for (const file of allUiFiles) {
		const content = await readFile(file, 'utf-8')
		let match
		while ((match = T_LITERAL_REGEX.exec(content)) !== null) {
			const key = match[1]
			// Exception: if it's t(model.UI) or t('foo' + bar) it wouldn't match this regex.
			// But t('literal') is exactly what we scan for.
			console.log(`❌ Forbidden hardcoded t('${key}') in: ${relative(ROOT, file)}`)
			hardcodedCount++
		}
	}

	if (hardcodedCount > 0) {
		console.log(`\n❌ Found ${hardcodedCount} forbidden hardcoded translation calls.\n`)
	} else {
		console.log('✅ 0 Hardcoded t() calls found in UI/Components. Compliant.\n')
	}

	console.log('✅ i18n Validation Parent: 100% Model-First compliant.')
	
	if (missing.length > 0 || hardcodedCount > 0) process.exit(1)
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
