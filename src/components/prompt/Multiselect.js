import { createPrompt } from '../../core/Component.js'
import { multiselect as baseMultiselect } from '../../ui/multiselect.js'

function getMultiselectInstructions(t) {
	if (!t) return undefined
	return (
		`\n${t('Instructions')}:\n` +
		`    ↑/↓: ${t('Highlight option')}\n` +
		`    ←/→/[space]: ${t('Toggle selection')}\n` +
		`    a: ${t('Toggle all')}\n` +
		`    enter/return: ${t('Complete answer')}`
	)
}

export function Multiselect(props) {
	return createPrompt('Multiselect', props, async (p) => {
		return await baseMultiselect({
			message: p.message || p.label,
			options: p.options,
			limit: p.limit,
			initial: p.initial,
			instructions: p.instructions !== undefined ? p.instructions : getMultiselectInstructions(p.t),
			hint: p.hint || (p.t ? p.t('hint.multiselect') : undefined),
		})
	})
}
