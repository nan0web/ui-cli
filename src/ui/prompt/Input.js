import { createPrompt } from '../core/Component.js'
import { text } from '../impl/input.js'
import { InputModel } from '../../domain/prompt/InputModel.js'

export { InputModel }

/**
 * Basic text input prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Input(props) {
	const model = new InputModel(props)
	return createPrompt('Input', model, async (p) => {
		// Adapting UI prop back to message for ui/input.js (which doesn't use t() literal anymore)
		return await text({
			...p,
			message: p.UI
		})
	})
}
