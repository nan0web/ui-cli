/**
 * Toggle module – a more visual boolean switch.
 * @module ui/toggle
 */
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * @param {Object} config
 * @param {string} config.message
 * @param {boolean} [config.initial=false]
 * @param {string} [config.active='yes']
 * @param {string} [config.inactive='no']
 * @returns {Promise<{value:boolean, cancelled:boolean}>}
 */
export async function toggle(config) {
    const { message, initial = false, active = 'yes', inactive = 'no' } = config
    const response = await prompts({
        type: 'toggle',
        name: 'value',
        message,
        initial,
        active,
        inactive
    }, {
        onCancel: () => {
            throw new CancelError()
        }
    })
    return { value: response.value, cancelled: false }
}
