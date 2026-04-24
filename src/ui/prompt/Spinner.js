import { createPrompt } from '../core/Component.js'
import { spinner } from '../impl/spinner.js'
import { SpinnerModel } from '../../domain/prompt/SpinnerModel.js'

export { SpinnerModel }

/**
 * Animated spinner controller.
 * @param {Object|string} props - Configuration or message.
 */
export function Spinner(props) {
	const model = new SpinnerModel(props)

	return createPrompt('Spinner', model, async (p) => {
		const t = p.t || ((k) => k)
		const s = spinner({
			...p,
			message: p.UI,
		})

		if (p.action && typeof p.action.then === 'function') {
			try {
				const res = await p.action
				const doneMsg = p.successMessage ? t(p.successMessage) : t(p.UI_DONE)
				s.success(doneMsg || '✔')
				return res
			} catch (err) {
				const errorMsg = p.errorMessage ? t(p.errorMessage) : t(p.UI_ERROR)
				s.error(errorMsg || '✖')
				throw err
			}
		}

		return s
	})
}
