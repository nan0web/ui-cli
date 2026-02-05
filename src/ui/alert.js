/**
 * Alert component – displays a prominent message box.
 *
 * @module ui/alert
 */

import Logger from '@nan0web/log'
import { beep } from './input.js'

/**
 * Renders an alert box and optionally plays a sound.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @param {Object} [options]
 * @param {string} [options.title] - Optional title.
 * @param {boolean} [options.sound=false] - Play beep sound.
 * @returns {string} Styled message block.
 */
export function alert(message, variant = 'info', options = {}) {
	const { title, sound = variant === 'error' || variant === 'warning' } = options

	if (sound) beep()

	const colors = {
		info: Logger.CYAN,
		success: Logger.GREEN,
		warning: Logger.YELLOW,
		error: Logger.RED,
	}

	const color = colors[variant] || Logger.WHITE
	const icon =
		{
			info: 'ℹ',
			success: '✔',
			warning: '⚠',
			error: '✖',
		}[variant] || '•'

	const lines = String(message || '').split('\n')
	const maxLineLen = Math.max(title ? String(title).length + 4 : 0, ...lines.map((l) => l.length))
	const len = Math.max(60, maxLineLen + 4)
	const border = Logger.style('━'.repeat(len), { color })

	let out = ''
	out += `\n${border}\n`
	if (title) {
		out += Logger.style(` ${icon} ${title} `, { color }) + '\n'
		out += Logger.style('─'.repeat(len) + '\n', { color: Logger.DIM })
	}
	lines.forEach((line) => {
		out += '   ' + Logger.style(line.trim(), { color }) + '\n'
	})
	out += `${border}\n`

	return out
}
