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
     * @param {string} [message]
     */
    constructor(message) {
        this.message = message || ''
        this.frameIndex = 0
        this.interval = null
        this.startTime = Date.now()
    }

    start() {
        this.startTime = Date.now()
        this.interval = setInterval(() => {
            const frame = Spinner.FRAMES[this.frameIndex]
            this.frameIndex = (this.frameIndex + 1) % Spinner.FRAMES.length

            const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
            const timeStr = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`

            process.stdout.write(`\r${frame} ${this.message} [${timeStr}]`)
        }, 80)
    }

    stop(status = '') {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
            process.stdout.write(`\r${status} ${this.message}\x1b[K\n`)
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
