/**
 * Model describing the Sortable component parameters.
 */
export class SortableModel {
	static UI = 'Reorder items'
	static help = 'Interactive drag-and-drop item reordering.'
	static UI_HINT = 'Use arrows to move. Space to grab or drop. Enter to confirm.'
	static UI_NAV = 'Navigate'
	static UI_GRAB = 'Grab'
	static UI_CONFIRM = 'Confirm'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.message || props.label || SortableModel.UI
		this.UI_HINT = props.UI_HINT || props.hint || SortableModel.UI_HINT
		this.items = props.items || []
	}
}
