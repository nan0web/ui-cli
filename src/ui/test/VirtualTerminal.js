import { EventEmitter } from 'node:events'
import { CancelError } from '@nan0web/ui/core'

/**
 * High-End In-Process Virtual Terminal for fast testing.
 * Mocks process.stdout and process.stdin to interact with CLI components without spawning processes.
 */
export class VirtualTerminal extends EventEmitter {
	/** @type {EventEmitter | undefined} */
	stdinBus;

	/** @type {Map<string, Function[]> | undefined} */
	_handlers;

	constructor() {
		super()
		this.output = []
		this.lines = []
		this.#setupMocks()
	}

	#originalStdoutWrite = process.stdout.write
	#originalStdinOn = process.stdin.on
	#originalStdinRemoveListener = process.stdin.removeListener
	#originalStdinPause = process.stdin.pause
	#originalStdinResume = process.stdin.resume
	#originalStdinSetRawMode = process.stdin.setRawMode

	#setupMocks() {
		const self = this
		
		// Mock stdout
		process.stdout.write = (chunk) => {
			const str = chunk.toString()
			self.output.push(str)
			self.emit('stdout', str)
			return true
		}

		// Mock stdin (simplified emitter)
		/** @type {EventEmitter} */
		this.stdinBus = new EventEmitter()
		/** @type {Map<string, Function[]>} */
		this._handlers = new Map()

		process.stdin.on = (event, handler) => {
			if (event === 'keypress' || event === 'data') {
				self.stdinBus?.on(event, handler)
				if (!self._handlers?.has(event)) self._handlers?.set(event, [])
				self._handlers?.get(event)?.push(handler)
			}
			return process.stdin
		}

		process.stdin.removeListener = (event, handler) => {
			self.stdinBus?.removeListener(event, handler)
			return process.stdin
		}
		const stdin = /** @type {any} */ (process.stdin)
		stdin.pause = () => {}
		stdin.resume = () => {}
		stdin.setRawMode = () => {}
	}

	restore() {
		// Clean up all added listeners from this bus
		if (this._handlers && this.stdinBus) {
			for (const [event, handlers] of this._handlers) {
				for (const h of handlers) {
					this.stdinBus.removeListener(event, /** @type {any} */ (h))
				}
			}
		}

		process.stdout.write = this.#originalStdoutWrite
		process.stdin.on = this.#originalStdinOn
		process.stdin.removeListener = this.#originalStdinRemoveListener
		process.stdin.pause = this.#originalStdinPause
		process.stdin.resume = this.#originalStdinResume
		process.stdin.setRawMode = this.#originalStdinSetRawMode
	}

	/**
	 * Simulate keypress
	 * @param {string} name - Key name (e.g. 'up', 'down', 'enter')
	 * @param {object} [extra] - Extra properties (ctrl, shift, etc.)
	 */
	sendKey(name, extra = {}) {
		const key = { name, ...extra }
		const str = (/** @type {any} */ (extra)).sequence || '' // Common in readline
		if (this.stdinBus) this.stdinBus.emit('keypress', str, key)
	}

	/**
	 * Simulate typing text
	 * @param {string} text 
	 */
	type(text) {
		for (const char of text) {
			this.sendKey(char)
		}
	}

	/**
	 * Get clean output lines
	 */
	getLines() {
		return this.output.join('').split('\n').filter(l => l.trim() !== '')
	}

	/**
	 * Clear captures
	 */
	clear() {
		this.output = []
	}

	/**
	 * Run a CLI component function
	 * @template T
	 * @param {() => Promise<T>} fn 
	 * @returns {Promise<T>}
	 */
	async run(fn) {
		try {
			return await fn()
		} finally {
			// Ensure cleanup?
		}
	}
}
