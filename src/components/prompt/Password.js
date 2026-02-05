import { createPrompt } from '../../core/Component.js'
import { text } from '../../ui/input.js'

export function Password(props) {
	return createPrompt('Password', props, async (p) => {
		return await text({
			message: p.message || p.label,
			initial: p.initial,
			type: 'password',
			validate: p.validate || p.validator,
		})
	})
}
