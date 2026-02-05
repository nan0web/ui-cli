import { createPrompt } from '../../core/Component.js'
import { datetime as baseDateTime } from '../../ui/date-time.js'
import { validateDate, validateString, validateFunction } from '../../core/PropValidation.js'

export function DateTime(props) {
	return createPrompt('DateTime', props, async (p) => {
		// Validate props
		validateString(p.message || p.label, 'message/label', 'DateTime', true)
		validateDate(p.initial, 'initial', 'DateTime')
		validateString(p.mask, 'mask', 'DateTime')
		validateFunction(p.t, 't', 'DateTime')

		// Auto-convert initial to Date if it's a string
		let initial = p.initial
		if (typeof initial === 'string') {
			initial = new Date(initial)
		}

		return await baseDateTime({
			message: p.message || p.label,
			initial: initial,
			mask: p.mask,
			t: p.t,
		})
	})
}
