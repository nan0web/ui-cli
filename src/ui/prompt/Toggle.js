import { createPrompt } from '../core/Component.js'
import { confirm as baseConfirm } from '../impl/confirm.js'
import { ToggleModel } from '../../domain/prompt/ToggleModel.js'

export { ToggleModel }

/**
 * Basic boolean toggle switch.
 * @param {Object|string} props - Configuration or message.
 */
export function Toggle(props) {
	const model = new ToggleModel(props)

	return createPrompt('Toggle', model, async (p) => {
		const yesLabel = p.t ? p.t(p.UI_YES) : p.UI_YES
		const noLabel = p.t ? p.t(p.UI_NO) : p.UI_NO

		return await baseConfirm({
			message: p.UI,
			initial: p.initial,
			active: yesLabel,
			inactive: noLabel,
		})
	})
}
