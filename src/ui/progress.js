/**
 * Progress module – visual progress bar with timers.
 * @module ui/progress
 */

/**
 * Renders a progress bar.
 */
export class ProgressBar {
	/**
	 * @param {Object} options
	 * @param {number} options.total
	 * @param {string} [options.title]
	 * @param {number} [options.width=40]
	 */
	constructor(options) {
		this.total = options.total
		this.title = options.title
		this.width = options.width || 40
		this.current = 0
		this.startTime = Date.now()
	}

	/**
	 * Update progress.
	 * @param {number} current
	 */
	update(current) {
		this.current = current
		this.render()
	}

	/**
	 * Increment progress.
	 * @param {number} [step=1]
	 */
	tick(step = 1) {
		this.current += step
		this.render()
	}

	render() {
		const percent = Math.min(100, Math.max(0, (this.current / this.total) * 100))
		const filledWidth = Math.round((this.width * percent) / 100)
		const emptyWidth = this.width - filledWidth

		const elapsed = (Date.now() - this.startTime) / 1000
		const rate = this.current / elapsed
		const remaining = rate > 0 ? (this.total - this.current) / rate : 0

		const bar = '='.repeat(filledWidth) + (filledWidth < this.width ? '>' : '') + '-'.repeat(Math.max(0, emptyWidth - 1))

		const timeStr = `[${this.formatTime(elapsed)} < ${this.formatTime(remaining)}]`

		const output = `\r${this.title ? this.title + ' ' : ''}[${bar}] ${percent.toFixed(0)}% ${timeStr}`
		process.stdout.write(output)

		if (this.current >= this.total) {
			process.stdout.write('\n')
		}
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
}

/**
 * Functional helper for progress.
 * @param {Object} options
 * @returns {ProgressBar}
 */
export function progress(options) {
	return new ProgressBar(options)
}
