import { createPrompt } from '../core/Component.js'
import { select } from '../impl/select.js'
import { SelectModel } from '../../domain/prompt/SelectModel.js'

export { SelectModel }

/**
 * Single-choice prompt from a list of options.
 * @param {Object|string} props - Configuration or message.
 */
export function Select(props) {
	const model = new SelectModel(props)

	return createPrompt('Select', model, async (p) => {
		return await select({
			...p,
			message: p.UI,
			hint: p.t ? p.t(p.UI_HINT) : p.UI_HINT
		})
	})
}
