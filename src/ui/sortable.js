/**
 * Sortable module – interactive reorderable list in CLI.
 *
 * Uses SortableList from @nan0web/ui as the headless data model.
 * Renders an interactive list where user can navigate with ↑/↓
 * and reorder items with Shift+↑/Shift+↓ (or k/j for reorder).
 *
 * @module ui/sortable
 */

import { CancelError } from '@nan0web/ui/core'
import { Component } from '@nan0web/ui'

const SortableList = Component.SortableList

/**
 * Format a single list item line.
 *
 * @param {string} label - Display label.
 * @param {boolean} active - Whether this item is highlighted.
 * @param {boolean} grabbed - Whether this item is grabbed for reorder.
 * @returns {string}
 */
function formatItem(label, active, grabbed) {
	const pointer = active ? '❯' : ' '
	const grab = grabbed ? '⇅' : ' '
	const dim = active ? '' : '\x1b[2m'
	const reset = active ? '' : '\x1b[0m'
	const cyan = active ? '\x1b[36m' : ''
	const cyanReset = active ? '\x1b[0m' : ''
	return `${grab} ${cyan}${pointer}${cyanReset} ${dim}${label}${reset}`
}

/**
 * Format the full list output.
 *
 * @param {string} message - Title / question.
 * @param {Array<{label: string, value: any}>} choices - Normalised choices.
 * @param {number} cursor - Active item index.
 * @param {boolean} grabbed - Whether in reorder mode.
 * @param {string} [hint] - Navigation hint.
 * @returns {string}
 */
function formatList(message, choices, cursor, grabbed, hint) {
	const lines = []
	const hintText = hint ? `\x1b[2m— ${hint}\x1b[0m` : ''
	lines.push(`\x1b[1m?\x1b[0m \x1b[1m${message}\x1b[0m ${hintText}`)
	for (let i = 0; i < choices.length; i++) {
		lines.push(formatItem(choices[i].label, i === cursor, grabbed && i === cursor))
	}
	return lines.join('\n')
}

/**
 * Interactive sortable list.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question / title.
 * @param {Array<string|{label:string, value:any}>} config.items - Items to sort.
 * @param {string} [config.hint] - Hint text.
 * @param {Function} [config.t] - Translation function.
 * @param {Function} [config.onChange] - Callback on every reorder.
 * @returns {Promise<{value: any[], cancelled: boolean}>}
 */
export async function sortable(config) {
	const { message, items, t, onChange } = config

	if (!Array.isArray(items) || items.length === 0) {
		throw new Error('Items array is required and must not be empty')
	}

	// Normalise items to {label, value}
	const normalised = items.map((el) => {
		if (typeof el === 'string') {
			return { label: el, value: el }
		}
		return { label: el.label || el['title'] || String(el.value), value: el.value }
	})

	const model = SortableList.create({
		items: normalised,
		onChange: (newItems) => {
			onChange?.(newItems.map((it) => it.value))
		},
	})

	const hint =
		config.hint ||
		(t
			? `${t('↑/↓')}: ${t('Navigate')}, Space: ${t('Grab')}, Enter: ${t('Confirm')}`
			: '↑/↓: Navigate, Space: Grab/Drop, Enter: Confirm')

	return new Promise((resolve, reject) => {
		let cursor = 0
		let grabbed = false
		const { stdin, stdout } = process
		/** @type {number} Number of lines drawn in previous render */
		let prevLines = 0

		const wasRaw = stdin.isRaw
		stdin.setRawMode(true)
		stdin.resume()

		function draw() {
			const currentItems = model.getItems()
			const output = formatList(message, currentItems, cursor, grabbed, hint)
			const lines = output.split('\n')

			// Move cursor up to overwrite previous render
			if (prevLines > 0) {
				stdout.write(`\x1b[${prevLines}A`)
			}

			// Clear each line and write new content
			for (let i = 0; i < lines.length; i++) {
				stdout.write('\x1b[2K' + lines[i] + '\n')
			}

			// Clear any leftover lines from previous render
			if (prevLines > lines.length) {
				for (let i = 0; i < prevLines - lines.length; i++) {
					stdout.write('\x1b[2K\n')
				}
				// Move cursor back up to the end of current content
				stdout.write(`\x1b[${prevLines - lines.length}A`)
			}

			prevLines = lines.length
		}

		function clearWidget() {
			if (prevLines > 0) {
				stdout.write(`\x1b[${prevLines}A`)
				for (let i = 0; i < prevLines; i++) {
					stdout.write('\x1b[2K\n')
				}
				stdout.write(`\x1b[${prevLines}A`)
			}
		}

		function cleanup() {
			stdin.setRawMode(wasRaw || false)
			stdin.removeListener('data', onData)
			stdin.pause()
		}

		function onData(data) {
			const key = data.toString()

			// Escape or Ctrl+C — cancel
			if (key === '\x1b' || key === '\x03') {
				cleanup()
				clearWidget()
				reject(new CancelError())
				return
			}

			// Enter — confirm
			if (key === '\r' || key === '\n') {
				cleanup()
				clearWidget()
				const finalItems = model.getItems()
				resolve({
					value: finalItems.map((it) => it.value),
					cancelled: false,
				})
				return
			}

			// Space — toggle grab mode
			if (key === ' ') {
				grabbed = !grabbed
				draw()
				return
			}

			// Arrow Up or k
			if (key === '\x1b[A' || key === 'k') {
				if (grabbed) {
					model.moveUp(cursor)
					if (cursor > 0) cursor--
				} else {
					cursor = Math.max(0, cursor - 1)
				}
				draw()
				return
			}

			// Arrow Down or j
			if (key === '\x1b[B' || key === 'j') {
				const len = model.getItems().length
				if (grabbed) {
					model.moveDown(cursor)
					if (cursor < len - 1) cursor++
				} else {
					cursor = Math.min(len - 1, cursor + 1)
				}
				draw()
				return
			}

			// Shift+Arrow Up — grab and move up
			if (key === '\x1b[1;2A') {
				grabbed = true
				model.moveUp(cursor)
				if (cursor > 0) cursor--
				draw()
				return
			}

			// Shift+Arrow Down — grab and move down
			if (key === '\x1b[1;2B') {
				const len = model.getItems().length
				grabbed = true
				model.moveDown(cursor)
				if (cursor < len - 1) cursor++
				draw()
				return
			}

			// 'r' — reset to initial order
			if (key === 'r' && !grabbed) {
				model.reset()
				cursor = 0
				draw()
				return
			}
		}

		stdin.on('data', onData)
		draw()
	})
}

export default sortable
