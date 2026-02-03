/**
 * Badge component – displays a small status label.
 *
 * @module ui/badge
 */

import Logger from '@nan0web/log'

/**
 * Renders a status badge.
 *
 * @param {string} label - Text to display.
 * @param {'info'|'success'|'warning'|'error'|'neutral'} [variant='neutral']
 * @returns {string} Styled string.
 */
export function badge(label, variant = 'neutral') {
    const colors = {
        info: { bg: 'BLUE', fg: 'WHITE' }, // Use keys compatible with Logger lookup if possible, or Logger constants
        success: { bg: 'GREEN', fg: 'BLACK' },
        warning: { bg: 'YELLOW', fg: 'BLACK' },
        error: { bg: 'RED', fg: 'WHITE' },
        neutral: { bg: 'WHITE', fg: 'BLACK' }
    }

    // Logger.style expects bgColor name or code.
    // Logger.BG_BLUE is a code.
    // But Logger.style implementation tries `Logger['BG_' + bgColor.toUpperCase()]`.
    // So if I pass 'BLUE', it looks for BG_BLUE.
    // If I pass Logger.BG_BLUE (the code), it uses it as raw.

    // Let's use string keys 'BLUE', etc.

    const style = colors[variant] || colors.neutral
    return Logger.style(` ${label} `, { color: Logger[style.fg] || style.fg, bgColor: style.bg })
}
