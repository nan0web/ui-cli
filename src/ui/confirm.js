/**
 * Confirm module – simple Yes/No prompt.
 * @module ui/confirm
 */
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'
import { validateString, validateBoolean, validateFunction } from '../core/PropValidation.js'

/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=true] - Default value (true=Yes, false=No)
 * @param {Function} [config.format] - Output value formatter
 * @param {string} [config.active] - Label for "Yes" state
 * @param {string} [config.inactive] - Label for "No" state
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export async function confirm(config) {
    // Validation
    validateString(config.message, 'message', 'Confirm', true)
    validateBoolean(config.initial, 'initial', 'Confirm')
    validateFunction(config.format, 'format', 'Confirm')
    validateString(config.active, 'active', 'Confirm')
    validateString(config.inactive, 'inactive', 'Confirm')
    validateFunction(config.t, 't', 'Confirm')

    const { message, initial = true, format, t = (k) => k } = config
    const active = config.active || t('yes')
    const inactive = config.inactive || t('no')

    const response = await prompts({
        type: 'toggle',
        name: 'value',
        message,
        initial,
        format,
        active,
        inactive
    }, {
        onCancel: () => {
            throw new CancelError()
        }
    })
    return { value: response.value, cancelled: false }
}
