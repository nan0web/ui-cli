/**
 * Autocomplete module - provides a searchable selection list.
 *
 * @module ui/autocomplete
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import Logger from '@nan0web/log'

/**
 * Highlights the matching part of the text based on the query.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
function highlight(text, query) {
    if (!query) return text
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return text.replace(regex, `${Logger.MAGENTA}$1${Logger.RESET}`)
}

/**
 * Renders a searchable selection list.
 *
 * @param {Object} input
 * @param {string} [input.message] - Prompt message.
 * @param {string} [input.title] - Alternative prompt title.
 * @param {Array|Function} input.options - List of options or async function to fetch them.
 * @param {number} [input.limit=10] - Max visible items.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>}
 */
export async function autocomplete(input) {
    const {
        message,
        title,
        options: initOptions,
        limit = 30,
    } = input

    let choices = []
    const fetch = async (query = '') => {
        let currentOptions = typeof initOptions === 'function' ? await initOptions(query) : initOptions

        // Normalize Map or Array
        if (currentOptions instanceof Map) {
            currentOptions = Array.from(currentOptions.entries()).map(([value, label]) => ({ label, value }))
        }

        const filtered = currentOptions
            .filter(el => {
                const label = typeof el === 'string' ? el : (el.title || el.label || '')
                return label.toLowerCase().includes(query.toLowerCase())
            })

        return filtered.map((el) => {
            const label = typeof el === 'string' ? el : (el.title || el.label)
            const value = typeof el === 'string' ? el : el.value
            return {
                title: highlight(label, query),
                value: value
            }
        })
    }

    choices = await fetch('')

    const response = await prompts({
        type: 'autocomplete',
        name: 'value',
        message: message || title,
        limit,
        choices: choices,
        suggest: (input, choices) => fetch(input)
    }, {
        onCancel: () => {
            throw new CancelError()
        }
    })

    const finalChoices = typeof initOptions === 'function' ? await fetch('') : choices
    const index = finalChoices.findIndex(c => c.value === response.value)

    return { index, value: response.value, cancelled: false }
}

