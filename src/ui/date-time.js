/**
 * Date/Time Picker module.
 * @module ui/date-time
 */
import prompts from 'prompts'
import { CancelError } from '@nan0web/ui/core'

/**
 * Prompt user for a date or time.
 *
 * @param {Object} config
 * @param {string} config.message
 * @param {Date} [config.initial]
 * @param {string} [config.mask] - Optional mask (e.g. 'YYYY-MM-DD HH:mm')
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:Date, cancelled:boolean}>}
 */
export async function datetime(config) {
    const { message, initial = new Date(), mask, t = (k) => k } = config

    try {
        const result = await prompts({
            type: 'date',
            name: 'value',
            message: t(message),
            initial,
            mask: mask || undefined
        }, {
            onCancel: () => {
                throw new CancelError()
            }
        })

        return { value: result.value, cancelled: false }
    } catch (err) {
        if (err instanceof CancelError) {
            return { value: initial, cancelled: true }
        }
        throw err
    }
}
