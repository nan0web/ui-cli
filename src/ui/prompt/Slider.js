import { createPrompt } from '../core/Component.js'
import { slider } from '../impl/slider.js'
import { SliderModel } from '../../domain/prompt/SliderModel.js'

export { SliderModel }

/**
 * Numeric slider prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Slider(props) {
	const model = new SliderModel(props)

	return createPrompt('Slider', model, async (p) => {
		return await slider({
			...p,
			message: p.UI
		})
	})
}
