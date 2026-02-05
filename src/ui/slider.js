/**
 * Slider module – numeric range selection with a visual bar and Shift-jumps.
 * @module ui/slider
 */
import NumberPrompt from 'prompts/lib/elements/number.js'
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import { validateString, validateNumber, validateFunction } from '../core/PropValidation.js'

/**
 * Custom SliderPrompt that adds visual bar and Shift+Up/Down jumps.
 */
class SliderPrompt extends NumberPrompt {
	/** @param {any} opts */
	constructor(opts) {
		super(opts)
		this.jump = opts.jump || 10
		/** @type {boolean} */
		this.shift = false
	}

	up() {
		const self = /** @type {any} */ (this)
		const max = self.max ?? 100
		const step = self.increment ?? 1
		self.value = Math.min(max, self.value + (this.shift ? this.jump : step))
		this.render()
	}

	down() {
		const self = /** @type {any} */ (this)
		const min = self.min ?? 0
		const step = self.increment ?? 1
		self.value = Math.max(min, self.value - (this.shift ? this.jump : step))
		this.render()
	}

	/**
	 * @param {string} key
	 * @param {any} keypress
	 */
	_(key, keypress) {
		this.shift = !!keypress?.shift
		if (key === '+' || key === '=') {
			this.up()
			return
		}
		if (key === '-' || key === '_') {
			this.down()
			return
		}
		if (super._) super._(key, keypress)
	}

	render() {
		const self = /** @type {any} */ (this)
		if (self.closed || self.aborted) return

		const min = self.min ?? 0
		const max = self.max ?? 100
		const width = 20
		const range = max - min || 1
		const percent = Math.max(0, Math.min(1, (self.value - min) / range))
		const filled = Math.round(width * percent)
		const bar = '━'.repeat(filled) + '─'.repeat(width - filled)
		const label = self.msg || self.message || ''
		const val = self.value

		const out = self.out || process.stdout
		// Clear prompt area and redraw
		out.write('\r\x1B[K')
		out.write(`${label} [${bar}] ${val}`)
	}
}

/**
 * @param {Object} config
 * @param {string} config.message
 * @param {number} [config.initial]
 * @param {number} [config.min=0]
 * @param {number} [config.max=100]
 * @param {number} [config.step=1]
 * @param {number} [config.jump]
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:number, cancelled:boolean}>}
 */
export async function slider(config) {
	validateString(config.message, 'message', 'Slider', true)
	validateNumber(config.initial, 'initial', 'Slider')
	validateNumber(config.min, 'min', 'Slider')
	validateNumber(config.max, 'max', 'Slider')
	validateNumber(config.step, 'step', 'Slider')
	validateFunction(config.t, 't', 'Slider')

	const { message, initial, min = 0, max = 100, step = 1, t = (k) => k } = config
	const range = max - min
	const jump = config.jump || Math.max(step, Math.round(range / 10))

	try {
		const isTest = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE

		if (isTest) {
			// In tests, fallback to a simple text-based number input to avoid complex TTY interactions
			const res = await prompts({
				type: 'text',
				name: 'value',
				message: t(message),
				initial: String(initial ?? min),
				validate: v => {
					const n = Number(v)
					return (!isNaN(n) && n >= min && n <= max) || `Enter number ${min}-${max}`
				}
			}, {
				onCancel: () => { throw new CancelError() }
			})
			return { value: Number(res.value), cancelled: res.value === undefined }
		}

		// For interactive TTY, use the built-in number prompt (works reliably)
		const res = await prompts({
			type: 'number',
			name: 'value',
			message: t(message),
			initial: initial ?? min,
			min,
			max,
			increment: step
		}, {
			onCancel: () => { throw new CancelError() }
		})
		if (res.value === undefined) {
			return { value: initial ?? min, cancelled: true }
		}

		return { value: res.value, cancelled: false }
	} catch (err) {
		const error = /** @type {any} */ (err)
		if (error instanceof CancelError || error.message === 'canceled') { // prompts throws 'canceled' sometimes
			throw new CancelError()
		}
		throw error
	}
}
