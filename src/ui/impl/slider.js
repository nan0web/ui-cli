/**
 * Slider module – numeric range selection with a visual bar and Shift-jumps.
 * @module ui/slider
 */
import NumberPrompt from 'prompts/lib/elements/number.js'
import prompts from './prompts.js'
import { CancelError } from '@nan0web/ui/core'

/**
 * Custom SliderPrompt that adds visual bar and Shift+Up/Down jumps.
 */
export class SliderPrompt extends NumberPrompt {
	/** @param {any} opts */
	constructor(opts) {
		super(opts)
		this.jump = opts.jump || 10
		/** @type {boolean} */
		this.shift = false
		this.value = opts.initial !== undefined ? Number(opts.initial) : (opts.min !== undefined ? Number(opts.min) : 0)
	}

	up() {
		this.#move(true, true) // Coarse: +10%
	}

	down() {
		this.#move(false, true) // Coarse: -10%
	}

	left() {
		this.#move(false, false) // Fine: -1
	}

	right() {
		this.#move(true, false) // Fine: +1
	}

	#move(isForward, isJump) {
		const self = /** @type {any} */ (this)
		const max = Number(self.max ?? 100)
		const min = Number(self.min ?? 0)
		const step = isJump ? this.jump : (self.inc ?? 1)
		const current = self.value !== '' ? Number(self.value) : Number(self.initial)

		if (isForward) {
			self.value = Math.min(max, current + step)
		} else {
			self.value = Math.max(min, current - step)
		}
		self.render()
	}

	/**
	 * @param {string} key
	 * @param {any} keypress
	 */
	_(key, keypress) {
		const isNav = keypress && ['up', 'down', 'right', 'left'].includes(keypress.name)

		if (!isNav) {
			if (key === '+' || key === '=' || key === 'k' || key === 'K') {
				this.up()
				return
			}
			if (key === '-' || key === '_' || key === 'j' || key === 'J') {
				this.down()
				return
			}
			if (key === 'l' || key === 'L') {
				this.right()
				return
			}
			if (key === 'h' || key === 'H') {
				this.left()
				return
			}
		}

		if (keypress?.name === 'right') {
			this.right()
			return
		}
		if (keypress?.name === 'left') {
			this.left()
			return
		}
		if (keypress?.name === 'up') {
			this.up()
			return
		}
		if (keypress?.name === 'down') {
			this.down()
			return
		}

		if (/[0-9]/.test(key)) {
			const self = /** @type {any} */ (this)
			const now = Date.now()
			if (now - self.lastHit > 3000) self.typed = '' // 3s relaxed timeout
			self.typed += key
			self.lastHit = now
			self.value = Math.min(self.parse(self.typed), self.max)
			self.render()
			return
		}

		// Let NumberPrompt handle other chars
		super._(key, keypress)
	}

	render() {
		const self = /** @type {any} */ (this)
		if (self.closed || self.aborted) return

		const min = self.min ?? 0
		const max = self.max ?? 100
		const prefix = self.msg || self.message || ''
		
		// NumberPrompt keeps _value = '' until user interacts, so fall back to initial
		const effective = self.value !== '' ? Number(self.value) : (self.initial !== '' ? Number(self.initial) : min)

		let width = 30
		const staticLength = `?  ${effective} (${min}-${max}) `.length + prefix.length
		const columns = (self.out || process.stdout).columns || 80
		
		if (staticLength + width > columns) {
			width = Math.max(10, columns - staticLength - 2)
		}

		const range = max - min || 1
		const percent = Math.max(0, Math.min(1, (effective - min) / range))
		const filled = Math.round(width * percent)

		// Green filled bar, gray remaining
		let bar
		if (filled > 0) {
			bar = '\x1B[32m' + '━'.repeat(filled - 1) + '\x1B[37m' + '◯' + '\x1B[90m' + '━'.repeat(Math.max(0, width - filled)) + '\x1B[0m'
		} else {
			bar = '\x1B[37m' + '◯' + '\x1B[90m' + '━'.repeat(Math.max(0, width - 1)) + '\x1B[0m'
		}

		const out = self.out || process.stdout
		out.write('\r\x1B[K') // clear line
		out.write(`? \x1B[1m${prefix}\x1B[0m ${bar} \x1B[36m${effective}\x1B[0m \x1B[90m(${min}-${max})\x1B[0m`)
	}
}

/**
 * Execute custom Prompt class as Promise
 */
function runPrompt(PromptClass, args, opts = {}) {
	return new Promise((res, rej) => {
		const p = new PromptClass(args)
		const onAbort = opts.onAbort || (() => {})
		const onSubmit = opts.onSubmit || ((v) => v)
		const onExit = opts.onExit || (() => {})
		p.on('state', args.onState || (() => {}))
		p.on('submit', (x) => res(onSubmit(x)))
		p.on('exit', (x) => res(onExit(x)))
		p.on('abort', (x) => {
			const err = onAbort(x)
			if (err) rej(err)
			else rej(new Error('abort'))
		})
	})
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
		const isTest = process.env.NODE_TEST_CONTEXT || process.env.PLAY_DEMO_SEQUENCE
		const isSnapshot = !!process.env.UI_SNAPSHOT

		if (isTest || isSnapshot) {
			if (prompts._injected && prompts._injected.length > 0) {
				const predefined = prompts._injected.shift()
				if (predefined instanceof Error) throw new CancelError()
				return { value: Number(predefined), cancelled: false }
			}
		}

		if (isTest && !isSnapshot) {
			// In automated tests (no snapshot), fallback to a simple text-based number input to avoid complex TTY interactions
			const res = await prompts(
				{
					type: 'text',
					name: 'value',
					message: t(message),
					initial: String(initial ?? min),
					validate: (v) => {
						const n = Number(v)
						return (!isNaN(n) && n >= min && n <= max) || `Enter number ${min}-${max}`
					},
				},
				{
					onCancel: () => {
						throw new CancelError()
					},
				}
			)
			return { value: Number(res.value), cancelled: res.value === undefined }
		}

		// For interactive TTY, use the custom visual SliderPrompt
		const res = await runPrompt(SliderPrompt, {
			name: 'value',
			message: t(message),
			initial: initial !== undefined ? Number(initial) : Number(min),
			min: Number(min),
			max: Number(max),
			increment: Number(step),
			jump: Number(jump),
		}, {
			onAbort: () => {
				return new CancelError('Operation cancelled by user')
			}
		})

		// Return clean output
		process.stdout.write('\n')
		return { value: res, cancelled: false }

	} catch (err) {
		const error = /** @type {any} */ (err)
		if (error instanceof CancelError || error.message === 'canceled') {
			throw new CancelError()
		}
		throw error
	}
}
