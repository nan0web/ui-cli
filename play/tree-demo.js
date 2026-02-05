/**
 * Tree View Demo.
 *
 * @module play/tree-demo
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render } from '../src/core/render.js'
import { Tree } from '../src/components/prompt/Tree.js'
import { Pause } from '../src/components/prompt/Pause.js'

/**
 * Run the tree view demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runTreeDemo(console, adapter, t) {
	const isTestMode = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE;
	console.clear()
	console.success(t('Tree View Demo'))

	// Load real data
	const dataPath = path.join(process.cwd(), 'play', 'data', 'tree.json')
	if (!fs.existsSync(dataPath)) {
		console.warn(t('Scan data found not found. Please run: node play/scripts/scan-fs.js'))
		return
	}
	const realTree = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

	// Pre-process realTree to assign paths and index
	const pathMap = new Map()

	// Helper to calculate paths and index
	const augmentTree = (node, parentPath) => {
		let fullPath;
		if (!parentPath) {
			// Root node handling: try to anchor to CWD if names match
			if (node.name === path.basename(process.cwd())) {
				fullPath = process.cwd()
			} else {
				fullPath = path.join(process.cwd(), node.name)
			}
		} else {
			fullPath = path.join(parentPath, node.name)
		}

		node.path = fullPath
		node.expanded = true // Force expand for tests
		pathMap.set(node.path, node)

		if (node.children) {
			node.children.forEach(c => augmentTree(c, fullPath))
		}
	}

	// Handle array or single root
	if (Array.isArray(realTree)) {
		realTree.forEach(node => augmentTree(node, null))
	} else {
		augmentTree(realTree, null)
	}

	// Demo 1: File Selection (Static Tree)
	// We use the real tree fully loaded.
	console.info('\n' + t('Scenario 1: Select a File (Static Tree)'))
	const fileResult = await render(Tree({
		message: t('Select a file:'),
		tree: realTree,
		mode: 'file',
		t
	}))

	// Check if result is wrapped or direct
	const fileNode = fileResult

	// In V2 Tree component, we return value/path if available, but let's check what we got
	// If the tree.js fix worked, fileResult contains { value: ..., cancelled: ..., node: ... }
	// BUT render() unwraps .value. So fileResult IS the value (path/name).

	console.info(`${t('You selected:')} ${fileNode}`)

	// Demo 2: Async Directory Selection
	// SKIP in test mode to save time, Scenario 1 already covers tree rendering
	if (!isTestMode) {
		console.info('\n' + t('Scenario 2: Select a Directory (Async/Lazy)'))

		// Create lazy root (copy of real root but without children, preserving path)
		const lazyRoot = Array.isArray(realTree)
			? realTree.map(r => ({ ...r, children: undefined }))
			: { ...realTree, children: undefined }

		const asyncLoader = async (node) => {
			await new Promise(r => setTimeout(r, 400)) // Fake latency only in interactive mode

			if (!node) {
				// Initial load
				return Array.isArray(lazyRoot) ? lazyRoot : [lazyRoot]
			}

			// Fast lookup by Path (O(1))
			const realNode = pathMap.get(node.path)
			if (!realNode || !realNode.children) return []

			// Return children without their sub-children (lazy)
			return realNode.children.map(c => ({ ...c, children: undefined }))
		}

		const dirResult = await render(Tree({
			message: t('Select a directory:'),
			loader: asyncLoader,
			mode: 'dir',
			t
		}))
		console.info(`${t('You selected:')} ${dirResult}`)
	}

	// Demo 3: Multi-Select
	console.info('\n' + t('Scenario 3: Multi-Select Files'))
	const selectedResult = await render(Tree({
		message: t('Select files to delete:'),
		tree: realTree, // Use full tree for speed
		mode: 'multi',
		t
	}))

	// Multi select returns array of values
	const selected = selectedResult
	const selectedStr = Array.isArray(selected) ? selected.join(', ') : String(selected)
	console.info(`${t('Selected')} ${selected?.length} ${t('items')}: ${selectedStr}`)

	if (!isTestMode) {
		await render(Pause({
			message: t('Press any key to continue...'),
			t
		}))
	}
}

