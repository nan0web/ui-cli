import { createView } from '../../core/Component.js'
import { breadcrumbs, tabs, steps } from '../../ui/nav.js'

export function Breadcrumbs(props) {
	if (Array.isArray(props)) props = { items: props }
	return createView('Breadcrumbs', props, (p) => {
		return breadcrumbs(p.items, p.options)
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
