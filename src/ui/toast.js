/**
 * Toast component – displays a brief notification.
 *
 * @module ui/toast
 */

import Logger from '@nan0web/log'

/**
 * Renders a toast message.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @returns {string} Styled string.
 */
export function toast(message, variant = 'info') {
	const icons = {
		info: 'ℹ',
		success: '✔',
		warning: '⚠',
		error: '✖',
	}
	const colors = {
		info: Logger.BLUE,
		success: Logger.GREEN,
		warning: Logger.YELLOW,
		error: Logger.RED,
	}

	const icon = icons[variant] || '•'
	const color = colors[variant] || Logger.WHITE

	return Logger.style(`${icon} ${message}`, { color })
}
