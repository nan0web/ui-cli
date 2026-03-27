import { createPrompt } from '../core/Component.js'
import { multiselect } from '../impl/multiselect.js'
import { MultiselectModel } from '../../domain/prompt/MultiselectModel.js'

export { MultiselectModel }

/**
 * Multi-choice checkbox prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Multiselect(props) {
	const model = new MultiselectModel(props)

	return createPrompt('Multiselect', model, async (p) => {
		const t = p.t || ((k) => k)
		return await multiselect({
			...p,
			message: p.UI,
			hint: t(p.UI_HINT),
			instructions: {
				header: t(MultiselectModel.UI_INSTRUCTIONS),
				highlight: t(MultiselectModel.UI_HIGHLIGHT),
				toggle: t(MultiselectModel.UI_TOGGLE),
				toggleAll: t(MultiselectModel.UI_TOGGLE_ALL),
				complete: t(MultiselectModel.UI_COMPLETE),
			},
		})
	})
}
