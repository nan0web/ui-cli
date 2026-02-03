/**
 * Slider module – numeric range selection with a visual bar and Shift-jumps.
 * @module ui/slider
 */
import NumberPrompt from 'prompts/lib/elements/number.js'
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

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
	const { message, initial, min = 0, max = 100, step = 1, t = (k) => k } = config
	const range = max - min
	const jump = config.jump || Math.max(step, Math.round(range / 10))

	try {
		const isTTY = process.stdout.isTTY
		const isTest = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE

		if (isTest || !isTTY) {
			// In tests, fallback to a simple text-based number input to avoid complex TTY interactions
			const res = await prompts({
				type: 'text',
				name: 'value',
				message: `${t(message)} (${min}-${max})`,
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

		const result = await prompts(
			{
				// Passing class directly to type as a function is the most robust way
				// to handle custom prompts in some library versions.
				type: () => SliderPrompt,
				name: 'value',
				message: `${t(message)} (${min}-${max})`,
				initial: initial ?? min,
				min,
				max,
				increment: step,
				jump,
			},
			{
				onCancel: () => {
					throw new CancelError()
				},
			}
		)

		if (result.value === undefined) {
			return { value: initial ?? min, cancelled: true }
		}

		return { value: result.value, cancelled: false }
	} catch (err) {
		if (err instanceof CancelError) {
			throw err
		}
		throw new CancelError()
	}
}
