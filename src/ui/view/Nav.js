import { createView } from '../core/Component.js'
import { breadcrumbs, tabs, steps } from '../impl/nav.js'

export function Breadcrumbs(props) {
	if (Array.isArray(props)) props = { items: props }
	return createView('Breadcrumbs', props, (p) => {
		const items = p.items || [...(p.history || []), p.url].filter(Boolean)
		return breadcrumbs(items, p.options)
	})
}

export function Tabs(props) {
	if (Array.isArray(props)) props = { items: props }
	return createView('Tabs', props, (p) => {
		return tabs(p.items, p.active)
	})
}

export function Steps(props) {
	if (Array.isArray(props)) props = { items: props }
	return createView('Steps', props, (p) => {
		return steps(p.items, p.current)
	})
}
