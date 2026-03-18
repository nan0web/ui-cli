/**
 * Mask module – provides interactive formatted input handling.
 *
 * @module ui/mask
 */

import { MaskHandler } from '@nan0web/ui/core'
import { CancelError } from '@nan0web/ui/core'
import { beep } from './input.js'
import Logger from '@nan0web/log'
import process from 'node:process'
import readline from 'node:readline'
import prompts from './prompts.js'

// --- ANSI Utilities ---
const ESC = '\x1B['
const HIDE_CURSOR = `${ESC}?25l`
const SHOW_CURSOR = `${ESC}?25h`
const UP = (n = 1) => `${ESC}${n}A`
const ERASE_DOWN = `${ESC}J`
const CLEAR_LINE = `${ESC}2K\r`

function printInteractive(msg) {
	if (!process.stdout.isTTY) return
	process.stdout.write(msg)
}

/**
 * Interactive formatted mask input.
 *
 * NOTE: Predefined/test answers are handled upstream by InputAdapter.requestMask
 * via answerQueue. This function only runs in interactive TTY mode.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '+38 (099) 999 9999')
 * @param {string} [config.placeholder] - Character or string placeholder
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
export async function mask(config) {
	const { message, mask: maskString, t } = config

	const handler = new MaskHandler(maskString)

	// Setup Input
	const { stdin, stdout } = process

	if (process.env.UI_SNAPSHOT || process.env.PLAY_DEMO_SEQUENCE) {
		if (prompts._injected && prompts._injected.length > 0) {
			const predefined = prompts._injected.shift()
			if (predefined instanceof Error) throw new CancelError()
			const handler = new MaskHandler(maskString)
			handler.setValue(predefined)
			return { value: handler.formatted, cancelled: false }
		}
	}

	if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
		stdin.setRawMode(true)
	}
	stdin.resume()
	readline.emitKeypressEvents(stdin)

	let done = false
	let error = ''

	function render() {
		let out = CLEAR_LINE
		out += Logger.style(`? ${t ? t(message) : message} `, { color: Logger.CYAN })
		out += Logger.style(`› ${handler.formatted}`, { color: Logger.WHITE })
		if (error) {
			out += Logger.style(`\n› ${error}`, { color: Logger.RED })
			// move cursor up
			out += UP(1) + '\r'
			out += `\x1B[${(t ? t(message) : message).length + 5 + handler.formatted.length}C`
		}
		printInteractive(out)
	}

	return new Promise((resolve, reject) => {
		const onKey = async (str, key) => {
			if (done) return

			// Handle Ctrl+C
			if (key.ctrl && key.name === 'c') {
				cleanup()
				reject(new CancelError())
				process.exit(1) // Emulate standard prompts behaviour
				return
			}

			if (key.name === 'escape') {
				cleanup()
				reject(new CancelError())
				return
			}

			if (key.name === 'return' || key.name === 'enter') {
				if (!handler.isComplete) {
					error = t ? t('Format must be:') + ` ${maskString}` : `Format must be: ${maskString}`
					beep()
				} else {
					done = true
					cleanup()
					resolve({ value: handler.formatted, cancelled: false })
				}
				render()
				return
			}

			if (key.name === 'backspace') {
				if (handler.backspace()) {
					error = '' // Clear error on edit
				} else {
					beep()
				}
				render()
				return
			}

			if (!key.ctrl && !key.meta && str && str.length === 1) {
				if (handler.input(str)) {
					error = ''
				} else {
					beep()
				}
				render()
			}
		}

		function cleanup() {
			stdin.removeListener('keypress', onKey)
			if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
				process.stdin.setRawMode(false)
			}
			stdin.pause()

			// Clear the line and error if present
			stdout.write(CLEAR_LINE)
			if (error) {
				stdout.write(ERASE_DOWN) // clear error line
			}
			
			if (done) {
				stdout.write(Logger.style(`✔ ${t ? t(message) : message} `, { color: Logger.GREEN }))
				stdout.write(Logger.style(`… ${handler.formatted}\n`, { color: Logger.DIM }))
			} else {
				stdout.write('\n')
			}
			stdout.write(SHOW_CURSOR)
		}

		stdin.on('keypress', onKey)
		stdout.write(HIDE_CURSOR)
		render()
	})
}
