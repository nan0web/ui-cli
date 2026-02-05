#!/usr/bin/env node
/**
 * I18n Completeness Checker
 *
 * Scans all source files for t('...') calls and verifies that all translation keys
 * exist in all vocabulary files.
 *
 * Exit codes:
 * - 0: All translations present
 * - 1: Missing translations found
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
 * @returns {Promise<Set<string>>}
 */
async function loadVocabKeys(vocabPath) {
    try {
        const module = await import(vocabPath)
        const vocab = module.default || module
        return new Set(Object.keys(vocab))
    } catch (error) {
        console.error(`❌ Failed to load vocab from ${vocabPath}:`, error.message)
        return new Set()
    }
}

/**
 * Main checker logic
 */
async function main() {
    console.log('🔍 Scanning source files for translation keys...\n')

    // 1. Find all source files
    const sourceFiles = await findJsFiles(SRC_DIR)
    console.log(`📂 Found ${sourceFiles.length} source files in src/`)

    // 2. Extract all unique translation keys
    const allKeys = new Set()
    for (const file of sourceFiles) {
        const keys = await extractKeysFromFile(file)
        keys.forEach(key => allKeys.add(key))
    }

    console.log(`🔑 Found ${allKeys.size} unique translation keys\n`)

    if (allKeys.size === 0) {
        console.log('✅ No translation keys found (nothing to check)')
        return
    }

    // 3. Find all vocab files
    const vocabFiles = await findJsFiles(VOCABS_DIR)
    const vocabFileNames = vocabFiles
        .filter(f => !f.endsWith('index.js'))
        .map(f => relative(ROOT, f))

    console.log(`📚 Checking vocabularies: ${vocabFileNames.join(', ')}\n`)

    // 4. Check each vocab file
    let hasErrors = false

    for (const vocabFile of vocabFiles) {
        if (vocabFile.endsWith('index.js')) continue

        const vocabName = relative(VOCABS_DIR, vocabFile).replace('.js', '')
        const vocabKeys = await loadVocabKeys(vocabFile)

        const missing = [...allKeys].filter(key => !vocabKeys.has(key))

        if (missing.length > 0) {
            hasErrors = true
            console.log(`❌ ${vocabName}: Missing ${missing.length} translation(s):`)
            missing.forEach(key => {
                console.log(`   - "${key}"`)
            })
            console.log()
        } else {
            console.log(`✅ ${vocabName}: All ${allKeys.size} keys present`)
        }
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60))
    if (hasErrors) {
        console.log('❌ I18n check FAILED: Missing translations detected')
        console.log('='.repeat(60))
        process.exit(1)
    } else {
        console.log('✅ I18n check PASSED: All translations complete')
        console.log('='.repeat(60))
    }
}

main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
})
