/**
 * Confirm module – simple Yes/No prompt.
 * @module ui/confirm
 */
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=true] - Default value (true=Yes, false=No)
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export async function confirm(config) {
    const { message, initial = true } = config
    const response = await prompts({
        type: 'confirm',
        name: 'value',
        message,
        initial
    }, {
        onCancel: () => {
            throw new CancelError()
        }
    })
    return { value: response.value, cancelled: false }
}
export default confirm
