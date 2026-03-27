/**
 * Spinner module – loading indicators.
 * @module ui/spinner
 */

/**
 * Visual spinner for async operations.
 */
export class Spinner {
	static FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

	/**
	 * @param {string|Object} [config]
	 */
	constructor(config) {
		this.config = typeof config === 'object' ? config : { message: config || '' }
		this.message = this.config.message || ''
		this.frameIndex = 0
		this.interval = null
		this.startTime = Date.now()
	}

	start() {
		if (this.interval) clearInterval(this.interval) // Prevent leaked intervals on repeated start()
		this.startTime = Date.now()
		this.interval = setInterval(() => {
			const frame = Spinner.FRAMES[this.frameIndex]
			this.frameIndex = (this.frameIndex + 1) % Spinner.FRAMES.length

			const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
			const timeStr = `${Math.floor(elapsed / 60)
				.toString()
				.padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`

			// Truncate message to avoid terminal line wrapping which breaks \r spinners
			const cols = process.stdout.columns || 80
			const maxLen = cols - timeStr.length - 6 // -6 for frames, spaces, brackets
			let displayMsg = String(this.message || '').replace(/\r?\n/g, ' ')
			if (displayMsg.length > maxLen) {
				displayMsg = displayMsg.substring(0, maxLen - 3) + '...'
			}

			process.stdout.write(`\r\x1b[2K${frame} ${displayMsg} [${timeStr}]`)
		}, 80)
	}

	stop(status = '') {
		if (this.interval) {
			clearInterval(this.interval)
			this.interval = null
			const displayMsg = String(this.message || '').replace(/\r?\n/g, ' ')
			process.stdout.write(`\r\x1b[2K${status} ${displayMsg}\n`)
		}
	}

	clear() {
		if (this.interval) {
			clearInterval(this.interval)
			this.interval = null
			process.stdout.write(`\r\x1b[2K`)
		}
	}

	success(msg) {
		if (msg) this.message = msg
		this.stop('✔')
	}

	error(msg) {
		if (msg) this.message = msg
		this.stop('✖')
	}
}

/**
 * Functional helper for spinner.
 * @param {string} message
 * @returns {Spinner}
 */
export function spinner(message) {
	const s = new Spinner(message)
	s.start()
	return s
}

/** @type {Array<{pattern: RegExp, replacement: string}>} */
Spinner.snapshotReplacements = [
	{ pattern: /^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏].*$/gm, replacement: '[SPINNER]' },
	{ pattern: /(\[SPINNER\]\n?)+/g, replacement: '[SPINNER]\n' },
	{ pattern: /\[\d{2}:\d{2}\]/g, replacement: '[XX:XX]' },
]
