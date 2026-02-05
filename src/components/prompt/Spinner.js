import { createPrompt } from '../../core/Component.js'
import { spinner as baseSpinner } from '../../ui/spinner.js'

/**
 * Spinner Component.
 * Usage: await render(Spinner({ message: 'Loading...', action: promise }))
 *
 * @param {Object} props
 * @param {string} props.message - Main message.
 * @param {Promise<any>} [props.action] - Async action to wait for.
 * @param {string} [props.successMessage] - Message on success.
 * @param {string} [props.errorMessage] - Message on error.
 */
export function Spinner(props) {
	return createPrompt('Spinner', props, async (p) => {
		const spin = baseSpinner(p.message)
		if (p.action && p.action.then) {
			try {
				const res = await p.action
				spin.success(p.successMessage || 'Done')
				return res
			} catch (err) {
				spin.error(p.errorMessage || 'Error')
				throw err
			}
		}
		return spin // Return controller if no action (legacy behavior)
	})
}
