/**
 * Multiselect module – provides interactive multiple-choice selection list.
 *
 * @module ui/multiselect
 */

import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * Interactive multiple selection with checkboxes.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {Array<string|Object>} config.options - List of choices
 * @param {number} [config.limit=10] - Visible items limit
 * @param {Array<any>} [config.initial=[]] - Initial selected values
 * @returns {Promise<{value: Array<any>, cancelled: boolean}>}
 */
export async function multiselect(config) {
    const { message, options, limit = 10, initial = [] } = config

    if (!Array.isArray(options) || options.length === 0) {
        throw new Error('Options array is required and must not be empty')
    }

    const choices = options.map((el) => {
        if (typeof el === 'string') {
            return { title: el, value: el, selected: initial.includes(el) }
        }
        return {
            title: el.label || el.title,
            value: el.value,
            selected: initial.includes(el.value)
        }
    })

    const response = await prompts({
        type: 'multiselect',
        name: 'value',
        message,
        choices,
        limit,
        instructions: false // cleaner UI
    }, {
        onCancel: () => {
            throw new CancelError()
        }
    })

    return { value: response.value || [], cancelled: false }
}

export default multiselect
