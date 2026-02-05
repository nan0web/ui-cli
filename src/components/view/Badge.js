import { createView } from '../../core/Component.js'
import { badge as baseBadge } from '../../ui/badge.js'

export function Badge(props) {
	if (typeof props === 'string') {
		props = { label: props }
	}
	return createView('Badge', props, (p) => {
		return baseBadge(p.label, p.variant)
	})
}
