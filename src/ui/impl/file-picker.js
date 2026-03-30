/**
 * FilePicker component - High-End interactive filesystem navigator.
 * 
 * @module ui/file-picker
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { tree } from './tree.js'
import { validateString, validateBoolean } from '../core/PropValidation.js'

// Simple in-memory cache for the session (High-End Optimization)
const FS_CACHE = new Map()

/**
 * File and Directory Picker
 * 
 * @param {Object} config
 * @param {string} [config.message='Select file:']
 * @param {string} [config.root='.'] Starting directory
 * @param {string} [config.mode='file'] 'file', 'dir', or 'any'
 * @param {boolean} [config.showHidden=false]
 * @param {boolean} [config.cache=true] Enable mtime-based optimization
 * @param {number} [config.maxDepth=5]
 * @param {string[]} [config.extensions=[]] Filter by extensions (e.g. ['.js', '.yaml'])
 * @param {Function} [config.t] Translator function
 */
export async function filePicker(config = {}) {
	const {
		message = 'Select file:',
		root = '.',
		mode = 'file',
		showHidden = false,
		cache = true,
		maxDepth = 5,
		extensions = [],
		t = (k) => k,
	} = config

	validateString(root, 'root', 'FilePicker')
	validateBoolean(cache, 'cache', 'FilePicker')

	const absRoot = path.resolve(root)

	/**
	 * Loader for tree component
	 * @param {import('./tree.js').TreeNode} node 
	 */
	const loader = async (node) => {
		const targetDir = String(node ? node.path : absRoot)
		const depth = node ? (node.depth || 0) + 1 : 0

		if (depth > maxDepth) return []

		try {
			const stats = await fs.stat(targetDir)
			const cached = cache ? FS_CACHE.get(targetDir) : null

			if (cached && cached.mtime === stats.mtimeMs) {
				return cached.children
			}

			/** @type {import('node:fs').Dirent[]} */
			const entries = await fs.readdir(targetDir, { withFileTypes: true })
			
			/** @type {Array<any>} */
			const children = entries
				.filter(entry => {
					if (!showHidden && entry.name.startsWith('.')) return false
					return true
				})
				.map(entry => {
					const fullPath = path.join(targetDir, entry.name)
					const isDir = entry.isDirectory()
					
					// Apply extension filter for files
					if (!isDir && extensions.length > 0) {
						const ext = path.extname(entry.name)
						if (!extensions.includes(ext)) return null
					}

					return {
						name: entry.name,
						type: isDir ? 'dir' : 'file',
						path: fullPath,
						value: fullPath,
						// Non-deterministic but helpful for UI
						payload: { rel: path.relative(absRoot, fullPath) }
					}
				})
				.filter((a) => a !== null)
				.sort((/** @type {any} */ a, /** @type {any} */ b) => {
					if (a.type === 'dir' && b.type === 'file') return -1
					if (a.type === 'file' && b.type === 'dir') return 1
					return a.name.localeCompare(b.name)
				})

			FS_CACHE.set(targetDir, { mtime: stats.mtimeMs, children })
			return children
		} catch (e) {
			return []
		}
	}

	return await tree({
		...config,
		message,
		mode: mode === 'any' ? 'multi' : mode,
		loader,
		tree: null // loader will handle initial load
	})
}
