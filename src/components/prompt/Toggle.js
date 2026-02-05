import { createPrompt } from '../../core/Component.js'
import { toggle as baseToggle } from '../../ui/toggle.js'

export function Toggle(props) {
	return createPrompt('Toggle', props, async (p) => {
		return await baseToggle({
			message: p.message || p.children,
			initial: p.initial,
			active: p.active,
			inactive: p.inactive,
		})
	})
}
