import { createPrompt } from '../../core/Component.js'
import { sortable as baseSortable } from '../../ui/sortable.js'

/**
 * Sortable Prompt Component.
 *
 * Interactive reorderable list — user can navigate and drag items
 * up/down to set the desired order.
 *
 * Uses SortableList from @nan0web/ui as headless data model.
 *
 * @param {Object} props
 * @param {string} props.message - Question / title.
 * @param {Array<string|{label:string, value:any}>} props.items - Items to sort.
 * @param {string} [props.hint] - Hint text.
 * @param {Function} [props.onChange] - Callback on every reorder.
 */
export function Sortable(props) {
	return createPrompt('Sortable', props, async (p) => {
		return await baseSortable({
			message: p.message || p.label || p.title,
			items: p.items || p.options,
			hint: p.hint || (p.t ? p.t('hint.sortable') : undefined),
			t: p.t,
			onChange: p.onChange,
		})
	})
}
