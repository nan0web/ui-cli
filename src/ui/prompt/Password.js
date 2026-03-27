import { createPrompt } from '../core/Component.js'
import { text } from '../impl/input.js'
import { PasswordModel } from '../../domain/prompt/PasswordModel.js'

export { PasswordModel }

/**
 * Basic password (masked) input prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Password(props) {
	const model = new PasswordModel(props)
	return createPrompt('Password', model, async (p) => {
		return await text({
			...p,
			message: p.UI,
			type: 'password'
		})
	})
}
