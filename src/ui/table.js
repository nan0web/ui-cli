/**
 * Table module – provides interactive tables with filtering and selection.
 *
 * @module ui/table
 */

import Logger from '@nan0web/log'
import { CancelError } from '@nan0web/ui/core'
import { text } from './input.js'

/**
 * Highlights matches in text.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
function highlight(text, query) {
    if (!query) return String(text)
    const str = String(text)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return str.replace(regex, `${Logger.MAGENTA}$1${Logger.RESET}`)
}

/**
 * Renders an interactive table.
 *
 * @param {Object} input
 * @param {Array<Object>} input.data - Data to display.
 * @param {Array<string>} [input.columns] - Columns to include.
 * @param {string} [input.title] - Table title.
 * @param {boolean} [input.interactive=true] - Whether to allow filtering.
 * @param {boolean} [input.instant=false] - Whether to use instant search (char-by-char).
 * @param {(val:string)=>string} [input.t] - Translation function.
 * @param {Logger} [input.logger] - Logger instance.
 * @param {Function} [input.prompt] - Prompt function.
 * @returns {Promise<{value:any, cancelled:boolean}>} Selected row (if interactive) or last state.
 */
export async function table(input) {
    const {
        data: rawData,
        columns = [],
        title,
        interactive = true,
        instant = false,
        t = (k) => k,
    } = input

    const logger = input.logger || new Logger()

    if (!interactive) {
        if (title) logger.info(title)
        logger.table(rawData, columns)
        return { value: rawData, cancelled: false }
    }

    let query = ''

    if (instant && process.stdin.isTTY) {
        return new Promise((resolve) => {
            const render = () => {
                const filteredData = rawData.filter((row) => {
                    if (!query) return true
                    return Object.values(row).some((val) =>
                        String(val).toLowerCase().includes(query.toLowerCase())
                    )
                })
                const displayData = filteredData.map(row => {
                    const highlightedRow = {}
                    for (const key in row) {
                        highlightedRow[key] = highlight(row[key], query)
                    }
                    return highlightedRow
                })
                const displayColumns = columns.map(c => highlight(c, query))

                logger.clear()
                const infoMsg = title ? `${title} (${t('filter')}: "${query}")` : `(${t('filter')}: "${query}")`
                logger.info(infoMsg)
                logger.table(displayData, displayColumns)
                process.stdout.write('> ' + query)
            }

            render()

            const onData = (chunk) => {
                const char = chunk.toString()
                if (char === '\r' || char === '\n') { // Enter
                    cleanup()
                    resolve({ value: query, cancelled: false })
                } else if (char === '\u0003' || char === '\u001b') { // Ctrl+C or Esc
                    cleanup()
                    resolve({ value: query, cancelled: true })
                } else if (char === '\u007f') { // Backspace
                    query = query.slice(0, -1)
                    render()
                } else {
                    // Only add printable characters
                    if (char.length === 1 && char.charCodeAt(0) >= 32) {
                        query += char
                        render()
                    }
                }
            }

            const cleanup = () => {
                process.stdin.off('data', onData)
                process.stdin.setRawMode(false)
                process.stdin.pause()
                process.stdout.write('\n')
            }

            process.stdin.setRawMode(true)
            process.stdin.resume()
            process.stdin.on('data', onData)
        })
    }

    // Default loop (Enter based)
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const filteredData = rawData.filter((row) => {
            if (!query) return true
            return Object.values(row).some((val) =>
                String(val).toLowerCase().includes(query.toLowerCase())
            )
        })

        const displayData = filteredData.map(row => {
            const highlightedRow = {}
            for (const key in row) {
                highlightedRow[key] = highlight(row[key], query)
            }
            return highlightedRow
        })
        const displayColumns = columns.map(c => highlight(c, query))

        logger.clear()
        if (title) logger.info(`${title} (${t('filter')}: "${query || t('none')}")`)
        logger.table(displayData, displayColumns)

        const promptFn = input.prompt || text
        const res = await promptFn({
            message: t('table.filter_prompt'),
            initial: query
        })

        if (res.cancelled || res.value === '::exit') {
            return { value: filteredData, cancelled: res.cancelled }
        }

        if (res.value === '::clear') {
            query = ''
        } else {
            query = res.value
        }
    }
}

