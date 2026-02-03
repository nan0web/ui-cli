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
    const { title, sound = (variant === 'error' || variant === 'warning') } = options

    if (sound) beep()

    const colors = {
        info: Logger.CYAN,
        success: Logger.GREEN,
        warning: Logger.YELLOW,
        error: Logger.RED
    }

    const color = colors[variant] || Logger.WHITE
    const icon = {
        info: 'ℹ',
        success: '✔',
        warning: '⚠',
        error: '✖'
    }[variant] || '•'

    let out = ''
    const border = Logger.style('━'.repeat(message.length + 4), { color })

    out += `\n${border}\n`
    if (title) {
        // Logger.style doesn't support bold, so we rely on color or generic style
        out += Logger.style(` ${icon} ${title} \n`, { color })
        // Use DIM for separator
        out += Logger.style('─'.repeat(message.length + 4) + '\n', { color: Logger.DIM })
    }
    out += Logger.style(` ${message} `, { color })
    out += `\n${border}\n`

    return out
}
