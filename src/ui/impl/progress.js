/**
 * Progress module – visual progress bar with timers.
 * @module ui/progress
 */

/**
 * Renders a progress bar.
 *
 * Template Variables Available for `format`:
 * - `{time}`: Combined elapsed & ETA time, e.g., `[00:00 < 00:00]` or `[00:00]` (indeterminate)
 * - `{title}`: The progress title/message
 * - `{bar}`: The progress bar wrapped in brackets, e.g., `[====>   ]`
 * - `{percent}`: Percentage with `%` sign, e.g., `50%`. Empty if indeterminate.
 * - `{count}`: Formatted current/total, e.g., `50/100` or `150` (indeterminate)
 * - `{elapsed}`: Only elapsed time, e.g., `00:00`
 * - `{eta}`: Only ETA time, e.g., `00:00`
 * - `{current}`: Raw current numeric value
 * - `{total}`: Raw total numeric value
 *
 * @example
 * const p = new ProgressBar({ format: '{time} {title} {bar} {percent} {count}' })
 */
export class ProgressBar {
	/** @type {Array<{pattern: RegExp, replacement: string}>} Replacements for snapshots */
	static snapshotReplacements = [
		{ pattern: /\[=*>?-*\] \d+% \[\d{2}:\d{2}( < \d{2}:\d{2})?\]/g, replacement: '[PROGRESS]' },
	]

	/** @type {number|undefined} Raw total value */
	total
	/** @type {string|undefined} Title of the progress bar */
	title
	/** @type {number} Width of the progress bar */
	width
	/** @type {number} Frames per second */
	fps
	/** @type {number} Current progress */
	current
	/** @type {number} Start time of the progress bar */
	startTime
	/** @type {string} Format string of the progress bar */
	format
	/** @type {number} Number of columns for the progress bar */
	columns

	/** @type {boolean} Whether to force rendering on a single line by dropping elements if needed */
	forceOneLine

	/**
	 * @param {Object} options
	 * @param {number} [options.total] Raw total value
	 * @param {string} [options.title] Title of the progress bar
	 * @param {number} [options.width=40] Width of the progress bar
	 * @param {number} [options.fps=25] Frames per second
	 * @param {string} [options.format] Format string of the progress bar
	 * @param {number} [options.columns] Number of columns for the progress bar
	 * @param {boolean} [options.forceOneLine=false] Force single line output
	 */
	constructor(options) {
		this.total = options.total
		this.title = options.title
		this.width = options.width || 12
		this.fps = options.fps || 10
		this.current = 0
		this.startTime = Date.now()
		this.format = options.format || '{time} {bar} {percent} {count} {title}'
		this.columns = options.columns || process.stdout.columns || 80
		this.forceOneLine = options.forceOneLine || false
	}

	/**
	 * Update progress.
	 * @param {number} current
	 * @param {Object} [options]
	 */
	update(current, options = {}) {
		if (current !== undefined) this.current = current
		if (options.total !== undefined) this.total = options.total
		if (options.title !== undefined) this.title = options.title
	}

	success(msg) {
		if (msg) this.title = msg
		if (!this.title?.startsWith('✔')) this.title = `\x1b[32m✔\x1b[0m ${this.title || ''}`
	}

	error(msg) {
		if (msg) this.title = msg
		if (!this.title?.startsWith('✖')) this.title = `\x1b[31m✖\x1b[0m ${this.title || ''}`
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
			.replace('{time}', vars.timeStr)
			.replace('{title}', vars.titleStr)
			.replace('{bar}', vars.barStr)
			.replace('{percent}', vars.percentStr)
			.replace('{count}', vars.countStr)
			.replace('{current}', vars.current)
			.replace('{total}', vars.totalStr)
			.replace('{elapsed}', vars.elapsedStr)
			.replace('{eta}', vars.etaStr)
		return out.replace(/\s+/g, ' ').trim()
	}

	renderToString() {
		const elapsed = (Date.now() - this.startTime) / 1000
		const timeStrElapsed = this.formatTime(elapsed)
		const rate = elapsed > 0 ? this.current / elapsed : 0

		let barStr, percentStr, etaStr, countStr, timeStr

		if (this.total !== undefined) {
			const percent = Math.min(100, Math.max(0, (this.current / this.total) * 100))
			const filledWidth = Math.round((this.width * percent) / 100)
			const emptyWidth = this.width - filledWidth

			const innerBar =
				'='.repeat(filledWidth) +
				(filledWidth < this.width ? '>' : '') +
				'-'.repeat(Math.max(0, emptyWidth - 1))

			barStr = `[${innerBar}]`
			percentStr = `${percent.toFixed(0)}%`
			countStr = `${this.current}/${this.total}`

			const remaining = rate > 0 ? (this.total - this.current) / rate : 0
			etaStr = this.formatTime(remaining)
			timeStr = `[${timeStrElapsed} < ${etaStr}]`
		} else {
			// Indeterminate mode (pulsing/bouncing bar)
			const pulseWidth = Math.max(3, Math.floor(this.width / 5))
			// Pulse moves back and forth
			const position = Math.floor(elapsed * 10) % (this.width * 2)
			const p = position >= this.width ? this.width * 2 - position - 1 : position

			const leftEmpty = Math.max(0, p - Math.floor(pulseWidth / 2))
			const rightEmpty = Math.max(0, this.width - leftEmpty - pulseWidth)
			const actualPulse = Math.max(0, this.width - leftEmpty - rightEmpty)

			const innerBar =
				' '.repeat(leftEmpty) +
				'<=>'.substring(0, actualPulse).padEnd(actualPulse, '=') +
				' '.repeat(rightEmpty)

			barStr = `[${innerBar}]`
			percentStr = ''
			countStr = `${this.current}`
			etaStr = '--:--'
			timeStr = `[${timeStrElapsed}]`
		}

		const vars = {
			timeStr,
			titleStr: this.title || '',
			barStr,
			percentStr,
			countStr,
			current: this.current,
			totalStr: this.total !== undefined ? this.total : '',
			elapsedStr: timeStrElapsed,
			etaStr,
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
					if (cleanTest.length > this.columns) {
						// Hard slice if it still exceeds (e.g. huge title)
						// We don't want to break ANSI so we just return it as is or do a naive slice
						// Since we prioritize 'working', we'll let it exceed slightly or trust the user
					}
					break
				}
			}
			return output
		}

		let output = this.#applyFormat(this.format, vars)

		// Smart wrap: if the output is too long, put the bar on the next line
		const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '')
		if (cleanOutput.length > this.columns && this.title) {
			const splitIndex = output.indexOf(barStr)
			if (splitIndex > 0) {
				const before = output.substring(0, splitIndex).trim()
				const after = output.substring(splitIndex)
				return `${before}\n${after}`
			}
		}

		return output
	}
}

/**
 * Functional helper for progress.
 * @param {Object} options
 * @returns {ProgressBar}
 */
export function progress(options) {
	return new ProgressBar(options)
}
