import { createPrompt } from '../core/Component.js'
import { sortable } from '../impl/sortable.js'
import { SortableModel } from '../../domain/prompt/SortableModel.js'

export { SortableModel }

/**
 * Interactive list sorting/reordering.
 * @param {Object|string} props - Configuration or message.
 */
export function Sortable(props) {
	const model = new SortableModel(props)
	return createPrompt('Sortable', model, async (p) => {
		const t = p.t || ((k) => k)
		return await sortable({
			...p,
			message: p.UI,
			hint: t(p.UI_HINT),
			controls: {
				nav: t(SortableModel.UI_NAV),
				grab: t(SortableModel.UI_GRAB),
				confirm: t(SortableModel.UI_CONFIRM),
			},
		})
	})
}
