import { createPrompt } from '../../core/Component.js'
import { slider as baseSlider } from '../../ui/slider.js'

export function Slider(props) {
	return createPrompt('Slider', props, async (p) => {
		return await baseSlider({
			message: p.message || p.label,
			initial: p.initial,
			min: p.min,
			max: p.max,
			step: p.step,
			jump: p.jump,
			t: p.t,
		})
	})
}
