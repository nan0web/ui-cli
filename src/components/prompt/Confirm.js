import { createPrompt } from '../../core/Component.js'
import { confirm as baseConfirm } from '../../ui/confirm.js'
import { validateString, validateBoolean } from '../../core/PropValidation.js'

export function Confirm(props) {
	return createPrompt('Confirm', props, async (p) => {
		// Validate props
		validateString(p.message || p.children, 'message/children', 'Confirm', true)
		validateBoolean(p.initial, 'initial', 'Confirm')

		const yesLabel = p.t ? p.t('yes') : 'yes'
		const noLabel = p.t ? p.t('no') : 'no'

		const result = await baseConfirm({
			message: p.message || p.children,
			initial: p.initial,
			format: (val) => (val ? yesLabel : noLabel),
			active: yesLabel,
			inactive: noLabel,
		})

		// Restore boolean value from formatted string
		if (typeof result.value === 'string') {
			result.value = result.value === yesLabel
		}

		return result
	})
}
