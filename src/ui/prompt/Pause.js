import { createPrompt } from '../core/Component.js'
import { pause } from '../impl/next.js'
import { PauseModel } from '../../domain/prompt/PauseModel.js'

export { PauseModel }

/**
 * Halts execution passively for a specified duration.
 *
 * @param {PauseModel|Object|number} props - Configuration or milliseconds.
 */
export function Pause(props) {
	const model = new PauseModel(props)

	return createPrompt('Pause', model, async (p) => {
		return await pause(p.ms)
	})
}
