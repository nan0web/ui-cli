import { createPrompt } from '../../core/Component.js'
import { next } from '../../ui/next.js'

export function Next(props) {
	return createPrompt('Next', props, async (p) => {
		return await next(p.conf || p.keys)
	})
}
