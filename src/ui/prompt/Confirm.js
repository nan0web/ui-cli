import { createPrompt } from '../core/Component.js'
import { confirm as baseConfirm } from '../impl/confirm.js'
import { ConfirmModel } from '../../domain/prompt/ConfirmModel.js'

export { ConfirmModel }

/**
 * Boolean confirmation prompt (Yes/No).
 * @param {Object|string} props - Configuration or message.
 */
export function Confirm(props) {
	const model = new ConfirmModel(props)

	return createPrompt('Confirm', model, async (p) => {
		const yesLabel = p.t ? p.t(p.UI_YES) : p.UI_YES
		const noLabel = p.t ? p.t(p.UI_NO) : p.UI_NO

		const result = await baseConfirm({
			message: p.UI,
			initial: p.initial,
			format: (val) => (val ? yesLabel : noLabel),
			active: yesLabel,
			inactive: noLabel,
		})

		if (result && typeof result.value === 'string') {
			result.value = result.value === yesLabel
		}

		return result
	})
}
