/**
 * Spinner module – loading indicators.
 * @module ui/spinner
 */

import process from 'node:process'

/**
 * Visual spinner for async operations.
 *
 * Template Variables Available for `format`:
 * - `{time}`: Elapsed time, e.g., `[00:00]`
 * - `{title}`: The progress title/message
 * - `{frame}`: The current spinner animation frame (e.g. `⠋`)
 *
 * @example
 * const s = new Spinner({ format: '{time} {frame} {title}' })
 */
export class Spinner {
	static FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

	/** @type {Object} Configuration for the spinner */
	#config = {}
	/** @type {Array<{pattern: RegExp, replacement: string}>} Replacements for snapshots */
	static snapshotReplacements = [
		{ pattern: /^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏].*$/gm, replacement: '[SPINNER]' },
		{ pattern: /(\[SPINNER\]\n?)+/g, replacement: '[SPINNER]\n' },
		{ pattern: /\[\d{2}:\d{2}\]/g, replacement: '[XX:XX]' },
	]

	/** @type {string} Message to display next to the spinner */
	message
	/** @type {number} Frames per second */
	fps
	/** @type {number} Index of the current frame */
	frameIndex
	/** @type {number} Start time of the spinner */
	startTime
	/** @type {string} Format of the spinner */
	format
	/** @type {string} Status of the spinner */
	status
	/** @type {number} Number of columns for the spinner */
	columns
	/** @type {boolean} Whether to force rendering on a single line */
	forceOneLine

	/**
	 * @param {Partial<Spinner> | string} [config] Configuration for the spinner
	 */
	constructor(config) {
		this.#config = typeof config === 'object' ? config : { message: config || '' }
		this.message = this.#config.message || ''
		this.fps = this.#config.fps || 10
		this.frameIndex = 0
		this.startTime = Date.now()
		this.format = this.#config.format || '{time} {frame} {title}'
		this.status = ''
		this.columns = this.#config.columns || process.stdout.columns || 80
		this.forceOneLine = this.#config.forceOneLine || false
	}

	/**
	 * Update message.
	 * @param {string} message
	 * @param {Object} [options]
	 */
	update(message, options = {}) {
		if (message !== undefined) this.message = message
	}

	success(msg) {
		if (msg) this.message = msg
		this.status = '✔'
	}

	error(msg) {
		if (msg) this.message = msg
		this.status = '✖'
	}

	formatTime(seconds) {
		if (!isFinite(seconds) || seconds < 0) return '--:--'
		const h = Math.floor(seconds / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		const s = Math.floor(seconds % 60)

		const parts = []
		if (h > 0) parts.push(h.toString().padStart(2, '0'))
		parts.push(m.toString().padStart(2, '0'))
		parts.push(s.toString().padStart(2, '0'))

		return parts.join(':')
	}

	#applyFormat(fmt, vars) {
		let out = fmt
			.replace('{frame}', vars.frameStr)
			.replace('{title}', vars.titleStr)
			.replace('{time}', vars.timeStr)
		return out.replace(/\s+/g, ' ').trim()
	}

	renderToString() {
		const frame = this.status || Spinner.FRAMES[this.frameIndex]
		if (!this.status) {
			this.frameIndex = (this.frameIndex + 1) % Spinner.FRAMES.length
		}

		const elapsed = (Date.now() - this.startTime) / 1000
		const timeStr = `[${this.formatTime(elapsed)}]`
		
		const displayMsg = String(this.message || '').replace(/\r?\n/g, ' ')

		const vars = {
			frameStr: frame,
			titleStr: displayMsg,
			timeStr
		}

		if (this.forceOneLine) {
			const elements = this.format.split(' ').filter(Boolean)
			let output = ''
			for (let i = elements.length; i >= 1; i--) {
				const testFormat = elements.slice(0, i).join(' ')
				const testOutput = this.#applyFormat(testFormat, vars)
				const cleanTest = testOutput.replace(/\x1b\[[0-9;]*m/g, '')
				if (cleanTest.length <= this.columns || i === 1) {
					output = testOutput
					break
				}
			}
			return output
		}

		return this.#applyFormat(this.format, vars)
	}
}

/**
 * Functional helper for spinner.
 * @param {Partial<Spinner>|string} config
 * @returns {Spinner}
 */
export function spinner(config) {
	return new Spinner(config)
}
