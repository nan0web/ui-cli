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
	constructor(opts) {
		super(opts)
		this.jump = opts.jump || 10
	}

	up() {
		const self = /** @type {any} */ (this)
		self.value = Math.min(self.max, self.value + (self.keypress?.shift ? self.jump : self.increment))
		self.render()
	}

	down() {
		const self = /** @type {any} */ (this)
		self.value = Math.max(self.min, self.value - (self.keypress?.shift ? self.jump : self.increment))
		self.render()
	}

	/** @param {any} key */
	_(key, keypress) {
		const self = /** @type {any} */ (this)
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
		const width = 20
		const range = self.max - self.min || 1
		const percent = Math.max(0, Math.min(1, (self.value - self.min) / range))
		const filled = Math.round(width * percent)
		const bar = '━'.repeat(filled) + '─'.repeat(width - filled)
		const label = self.msg
		const val = self.value
		self.out.write(`\r${label} [${bar}] ${val}  `)
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
				type: /** @type {any} */ (SliderPrompt),
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
