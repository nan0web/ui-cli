/**
 * Navigation components – Breadcrumbs, Tabs, Steps.
 *
 * @module ui/nav
 */

import Logger from '@nan0web/log'

/**
 * Renders a breadcrumb trail.
 *
 * @param {string[]} items - List of path segments.
 * @param {Object} [options]
 * @param {string} [options.separator='›'] - Separator character.
 * @returns {string} Styled string.
 */
export function breadcrumbs(items, options = {}) {
    const { separator = '›' } = options
    const sepStyle = Logger.style(` ${separator} `, { color: Logger.DIM })

    return items.map((item, index) => {
        const isLast = index === items.length - 1
        // Last item usually bold or white, previous dimmed
        return Logger.style(item, { color: isLast ? Logger.WHITE : Logger.DIM })
    }).join(sepStyle)
}

/**
 * Renders a tab bar (visual only).
 *
 * @param {string[]} items - List of tab labels.
 * @param {number} [active=0] - Index of active tab.
 * @returns {string} Styled string.
 */
export function tabs(items, active = 0) {
    return items.map((item, index) => {
        const isActive = index === active
        if (isActive) {
            // Active: Inverse or highlighted
            const bg = 'BLUE' // Logger looks up keys or constant values
            return Logger.style(` ${item} `, { color: Logger.WHITE, bgColor: bg })
        }
        // Inactive: Dimmed or standard
        return Logger.style(` ${item} `, { color: Logger.DIM })
    }).join(Logger.style('│', { color: Logger.DIM }))
}

/**
 * Renders a step indicator (wizard).
 *
 * @param {string[]} items - List of step labels.
 * @param {number} [current=0] - Index of current step.
 * @returns {string} Styled string.
 */
export function steps(items, current = 0) {
    return items.map((item, index) => {
        if (index < current) {
            // Completed
            return Logger.style(`✔ ${item}`, { color: Logger.GREEN })
        } else if (index === current) {
            // Current
            return Logger.style(`● ${item}`, { color: Logger.CYAN })
        } else {
            // Future
            return Logger.style(`○ ${item}`, { color: Logger.DIM })
        }
    }).join(Logger.style(' ─ ', { color: Logger.DIM }))
}
