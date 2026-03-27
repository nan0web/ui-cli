import { createPrompt } from '../core/Component.js'
import { progress } from '../impl/progress.js'
import { ProgressBarModel } from '../../domain/prompt/ProgressBarModel.js'

export { ProgressBarModel }

/**
 * Visual task progress bar.
 * @param {Object|string} props - Configuration or message.
 */
export function ProgressBar(props) {
	const model = new ProgressBarModel(props)
	return createPrompt('ProgressBar', model, (p) => {
		const t = p.t || ((k) => k)
		return progress({
			...p,
			message: p.UI,
			error: t(p.UI_ERROR)
		})
	})
}
