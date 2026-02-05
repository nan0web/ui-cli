/**
 * Tree View Component - Interactive File/Directory Tree.
 *
 * @module ui/tree
 */

import process from 'node:process'
import readline from 'node:readline'
import Logger from '@nan0web/log'
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import { beep } from './input.js'
import {
	validateString,
	validateFunction,
	validateNumber,
	validateBoolean,
} from '../core/PropValidation.js'

// --- ANSI Utilities ---
const ESC = '\x1B['
const HIDE_CURSOR = `${ESC}?25l`
const SHOW_CURSOR = `${ESC}?25h`
const UP = (n = 1) => `${ESC}${n}A`
const ERASE_DOWN = `${ESC}J`

/**
 * @typedef {Object} TreeNode
 * @property {string} name
 * @property {'file'|'dir'} type
 * @property {TreeNode[]} [children] -- If undefined, might be loaded async
 * @property {any} [payload] -- Custom data
 * @property {any} [value] -- Result value (usually same as path or name)
 * @property {string} [path] -- File path
 * @property {boolean} [expanded] -- Internal state
 * @property {boolean} [checked] -- Internal state
 * @property {number} [depth] -- Calculated
 */

/**
 * Tree Prompt
 */
export async function tree(config) {
	const {
		message = 'Select:',
		mode = 'file', // 'file', 'dir', 'multi'
		tree = null, // Root node or array of nodes
		loader = null, // async (node) => children[]
		limit = 10,
		initialExpanded = [], // keys or paths
		multiselect = mode === 'multi',
		t = (k) => k,
	} = config

	// Prop Validation
	validateString(message, 'message', 'Tree')
	validateString(mode, 'mode', 'Tree')
	validateNumber(limit, 'limit', 'Tree')
	validateFunction(loader, 'loader', 'Tree')
	validateFunction(t, 't', 'Tree')
	validateBoolean(multiselect, 'multiselect', 'Tree')

	// Initialize State
	let roots = Array.isArray(tree) ? tree : tree ? [tree] : []
	// If tree is empty, try to load if loader exists
	if (roots.length === 0 && loader) {
		const res = await loader(null) // Load roots
		roots = res || []
	}

	// Automated environments support via PLAY_DEMO_SEQUENCE
	if (process.env.PLAY_DEMO_SEQUENCE) {
		const response = await prompts({
			type: 'text',
			name: 'value',
			message: t(message),
			initial: config.initial || roots[0]?.name || 'unknown',
		})
		return { value: response.value, cancelled: response.value === undefined }
	}

	// Internal State
	const state = {
		roots,
		cursor: 0, // Index in flattened list
		offset: 0, // Scroll offset
		expanded: new Set(), // Set of objects (nodes)
		checked: new Set(), // Set of objects (nodes)
		/** @type {TreeNode[]} */
		flat: [], // Flattened visible nodes
		loading: false,
		message,
		done: false,
		aborted: false,
	}

	// Helper: Flatten visible nodes
	function flatten() {
		/** @type {TreeNode[]} */
		const list = []
		const traverse = (nodes, depth) => {
			for (const node of nodes) {
				node.depth = depth
				list.push(node)
				if (state.expanded.has(node) && node.children) {
					traverse(node.children, depth + 1)
				}
			}
		}
		traverse(state.roots, 0)
		return list
	}

	// Load children if needed
	async function toggleExpand(node) {
		if (node.type !== 'dir') return

		if (state.expanded.has(node)) {
			state.expanded.delete(node)
		} else {
			state.expanded.add(node)
			if (!node.children && loader) {
				state.loading = true
				render() // Show loading
				try {
					const children = await loader(node)
					node.children = children || []
				} catch (e) {
					state.expanded.delete(node) // Rollback
				}
				state.loading = false
			}
		}
		state.flat = flatten()
	}

	function up() {
		if (state.cursor > 0) {
			state.cursor--
			if (state.cursor < state.offset) {
				state.offset--
			}
		}
	}

	function down() {
		if (state.cursor < state.flat.length - 1) {
			state.cursor++
			if (state.cursor >= state.offset + limit) {
				state.offset++
			}
		}
	}

	function left() {
		const node = state.flat[state.cursor]
		if (state.expanded.has(node)) {
			// Collapse
			toggleExpand(node)
		} else {
			// Jump to parent
			if (node.depth && node.depth > 0) {
				// Find parent index: look backwards for node with depth - 1
				for (let i = state.cursor - 1; i >= 0; i--) {
					if (state.flat[i].depth === node.depth - 1) {
						state.cursor = i
						// Update scroll
						if (state.cursor < state.offset) state.offset = state.cursor
						break
					}
				}
			}
		}
	}

	async function right() {
		const node = state.flat[state.cursor]
		if (node.type === 'dir') {
			if (!state.expanded.has(node)) {
				await toggleExpand(node)
			}
		}
	}

	function check() {
		if (!multiselect) return
		const node = state.flat[state.cursor]
		if (state.checked.has(node)) state.checked.delete(node)
		else state.checked.add(node)
	}

	// Initial Flatten
	state.flat = flatten()

	// Setup Input
	const { stdin, stdout } = process
	if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
		stdin.setRawMode(true)
	}
	stdin.resume()
	readline.emitKeypressEvents(stdin)

	// Render Loop
	let linesRendered = 0
	let firstRender = true

	function render() {
		if (!firstRender) {
			// Clear previous output
			stdout.write(UP(linesRendered) + ERASE_DOWN)
		}
		firstRender = false

		let out = ''
		// Title
		out += Logger.style(`? ${t(state.message)}\n`, { color: Logger.CYAN })

		// Tree View
		const visible = state.flat.slice(state.offset, state.offset + limit)

		if (visible.length === 0) {
			out += Logger.style(`  ${t('tree.empty')}\n`, { color: Logger.DIM })
		}

		for (let i = 0; i < visible.length; i++) {
			const node = visible[i]
			const absIndex = state.offset + i
			const isFocused = absIndex === state.cursor

			// Indent
			let line = '  '.repeat(node.depth || 0)

			// Prefix (Expandable)
			if (node.type === 'dir') {
				line += state.expanded.has(node) ? '▼ ' : '▶ '
			} else {
				line += '  ' // Align with arrows
			}

			// Checkbox
			if (multiselect) {
				const isChecked = state.checked.has(node)
				line += isChecked
					? Logger.style('◉ ', { color: Logger.GREEN })
					: Logger.style('◯ ', { color: Logger.DIM })
			}

			// Icon + Name
			const icon = node.type === 'dir' ? '📁' : '📄'
			const nameDisplay = `${icon} ${node.name}`

			if (isFocused) {
				// Use bold/color for focus
				line += Logger.style('> ' + nameDisplay, { color: Logger.CYAN })
				if (state.loading && state.expanded.has(node))
					line += Logger.style(` ${t('tree.loading')}`, { color: Logger.DIM })
			} else {
				line += '  ' + nameDisplay
			}

			out += line + '\n'
		}

		// Instructions / Footer
		const helpKey = multiselect ? 'tree.help.multi' : 'tree.help.single'
		out += Logger.style(`\n${t(helpKey)}`, { color: Logger.DIM })

		stdout.write(out)
		linesRendered = out.split('\n').length - 1 // approximate
	}

	// Interactive Loop
	return new Promise((resolve, reject) => {
		const onKey = async (str, key) => {
			if (state.done) return

			// Handle Ctrl+C
			if (key.ctrl && key.name === 'c') {
				cleanup()
				reject(new CancelError())
				return
			}

			if (state.loading) return // Block input while loading

			switch (key.name) {
				case 'up':
					up()
					break
				case 'down':
					down()
					break
				case 'left':
					left()
					break // Sync handled?
				case 'right':
					await right()
					break
				case 'space':
					check()
					break
				case 'return':
				case 'enter':
					submit()
					return
				default:
					if (!key.ctrl && !key.meta && str && str.length === 1) {
						const s = str.toLowerCase()
						const idx = state.flat.findIndex(
							(n, i) => i > state.cursor && n.name.toLowerCase().startsWith(s)
						)
						if (idx !== -1) {
							state.cursor = idx
						} else {
							const idx2 = state.flat.findIndex((n) => n.name.toLowerCase().startsWith(s))
							if (idx2 !== -1) state.cursor = idx2
						}
						// Adjust scroll offset
						if (state.cursor < state.offset) state.offset = state.cursor
						if (state.cursor >= state.offset + limit)
							state.offset = Math.max(0, state.cursor - limit + 1)
					}
					break
			}

			state.flat = flatten() // Re-flatten (redundant if only selection moved, but safe)
			render()
		}

		function submit() {
			if (multiselect) {
				state.done = true
				cleanup()
				resolve({
					value: Array.from(state.checked).map((n) => n.value || n.path || n.name),
					cancelled: false,
				})
			} else {
				const node = state.flat[state.cursor]
				if (!node) return // Nothing to submit
				// Validation
				if (mode === 'file' && node.type !== 'file') {
					// If Enter on dir in 'file' mode -> toggle expand
					if (node.type === 'dir') {
						toggleExpand(node).then(() => {
							state.flat = flatten()
							render()
						})
						return
					}
				}
				if (mode === 'dir' && node.type !== 'dir') {
					beep()
					return
				}
				state.done = true
				cleanup()
				resolve({ value: node.value || node.path || node.name, cancelled: false, node })
			}
		}

		function cleanup() {
			stdin.removeListener('keypress', onKey)
			if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
				process.stdin.setRawMode(false)
			}
			stdin.pause() // Crucial for automated tests to release event loop

			// Final cleanup message or checkmark?
			if (state.done) {
				stdout.write(UP(linesRendered) + ERASE_DOWN)
				stdout.write(Logger.style(`✔ ${t(state.message)} `, { color: Logger.GREEN }))
				// Show result summary
				if (multiselect) {
					stdout.write(
						Logger.style(`${state.checked.size} ${t('tree.selected')}\n`, { color: Logger.WHITE })
					)
				} else {
					const node = state.flat[state.cursor]
					stdout.write(Logger.style(`${node.name}\n`, { color: Logger.WHITE }))
				}
			} else {
				// Cancelled
				stdout.write('\n')
			}
			stdout.write(SHOW_CURSOR)
		}

		stdin.on('keypress', onKey)
		stdout.write(HIDE_CURSOR)
		render()
	})
}
