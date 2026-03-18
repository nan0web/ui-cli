import basePrompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * Wrapper for prompts to handle Ctrl+C application-wide exit
 * while allowing Escape to just throw CancelError (return to previous menu).
 */
const prompts = async function(questions, options = {}) {
	// In automated test/snapshot mode, bypass the wrapper entirely.
	// The keypress listener and onCancel modifications interfere with inject() behavior.
	if (process.env.UI_SNAPSHOT || process.env.PLAY_DEMO_SEQUENCE) {
		return basePrompts(questions, options)
	}

	let wasAborted = false

	const qArray = Array.isArray(questions) ? questions : [questions]
	const modifiedQuestions = qArray.map((q) => {
		const origOnState = q.onState
		return {
			...q,
			onState: (state) => {
				if (state.aborted) wasAborted = true
				if (origOnState) origOnState(state)
			},
		}
	})

	let escapePressed = false
	const listener = (str, key) => {
		if (key && key.name === 'escape') {
			escapePressed = true
		} else if (key && key.name === 'c' && key.ctrl) {
			escapePressed = false
		} else if (key && key.name === 'd' && key.ctrl) {
			escapePressed = false
		}
	}
	// Only attach keypress listener in interactive TTY mode
	// In piped/test mode, stdin may produce spurious keypress events from ANSI sequences
	const isTTY = process.stdin.isTTY
	if (isTTY) process.stdin.on('keypress', listener)

	const origOnCancel = options.onCancel
	const modifiedOptions = {
		...options,
		onCancel: (prompt, answers) => {
			// If we are in automated test environment, never exit process
			if (wasAborted && !escapePressed && !process.env.UI_SNAPSHOT && !process.env.PLAY_DEMO_SEQUENCE) {
				// Ctrl+C was pressed, abort entire application
				process.exit(0)
			}
			if (origOnCancel) return origOnCancel(prompt, answers)
			throw new CancelError('Cancelled by user')
		},
	}

	try {
		return await basePrompts(modifiedQuestions, modifiedOptions)
	} finally {
		if (isTTY) process.stdin.removeListener('keypress', listener)
	}
}

// Inherit any static properties/methods like inject
Object.assign(prompts, basePrompts)
Object.defineProperty(prompts, '_injected', {
	get: () => basePrompts._injected,
	set: (v) => { basePrompts._injected = v }
})

/** @type {import('prompts') & { inject: (answers: any[]) => void }} */
const exportedPrompts = /** @type {any} */ (prompts)
export default exportedPrompts
