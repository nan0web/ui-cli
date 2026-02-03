/**
 * File System Scanner
 * Scans a directory and exports its structure to a JSON file.
 * Usage: node play/scripts/scan-fs.js [targetDir] [outputFile]
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const IGNORE = new Set(['node_modules', '.git', '.DS_Store', 'dist', '.gemini', '.turbo', 'coverage'])

function scan(dir, name = 'root') {
    const stats = fs.statSync(dir)
    const node = {
        name: name || item,
        type: stats.isDirectory() ? 'dir' : 'file',
    }

    if (node.type === 'dir') {
        try {
            node.children = fs.readdirSync(dir)
                .filter(item => !IGNORE.has(item))
                .map(item => scan(path.join(dir, item), item))
                // Sort: directories first, then files
                .sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name)
                    return a.type === 'dir' ? -1 : 1
                })
        } catch (e) {
            // Permission errors etc.
            node.error = e.message
            node.children = []
        }
    }

    return node
}

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
const outFile = process.argv[3] ? path.resolve(process.argv[3]) : path.join(process.cwd(), 'play/data/tree.json')

console.log(`Scanning: ${targetDir}`)
const tree = scan(targetDir, path.basename(targetDir))
const json = JSON.stringify(tree, null, 2)

// Verify json is not empty and has content
if (json.length < 50) {
    console.error('Error: output too small, something went wrong.')
    process.exit(1)
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, json)
console.log(`Saved tree to: ${outFile} (${(json.length / 1024).toFixed(2)} KB)`)
