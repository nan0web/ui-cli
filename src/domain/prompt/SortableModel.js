import { Model } from '@nan0web/types'

/**
 * Model describing the Sortable component parameters.
 */
export class SortableModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Reorder items' }
	static help = 'Interactive drag-and-drop item reordering.'
	static UI_HINT = { alias: 'hint', default: 'Use arrow-keys. Space to grab. Enter to confirm. TAB for search.' }
	static UI_NAV = { default: 'Use arrow-keys. Space to grab. Enter to confirm. TAB for search.' }
	static UI_GRAB = { default: 'Use arrow-keys. Space to drop. Enter to confirm.' }
	static UI_CONFIRM = { default: 'Items reordered.' }
	static items = { default: [] }

	/**
	 * @param {Partial<SortableModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Hint text. */ this.UI_HINT
		/** @type {string} Navigation instructions. */ this.UI_NAV
		/** @type {string} Grab instructions. */ this.UI_GRAB
		/** @type {string} Confirm message. */ this.UI_CONFIRM
		/** @type {Array<any>} Items to sort. */ this.items
	}

	/**
	 * Map a predefined comma-separated answer to a sortable result.
	 *
	 * @param {string} predefined - Injected answer.
	 * @returns {{value: any[], cancelled: boolean}}
	 */
	automatedInput(predefined) {
		// Normalise items to {label, value}
		const normalised = (this.items || []).map((el) => {
			if (typeof el === 'string') return { label: el, value: el }
			return { label: el.label || el.title || el.name, value: el.value }
		})

		// Predefined = comma-separated values in desired order
		const order = String(predefined)
			.split(',')
			.map((v) => v.trim())
			.filter(Boolean)

		const ordered = []
		for (const val of order) {
			const item = normalised.find((it) => String(it.value) === val)
			if (item) ordered.push(item.value)
		}

		// Append any items not mentioned in the predefined order
		for (const item of normalised) {
			if (!ordered.includes(item.value)) ordered.push(item.value)
		}

		return { value: ordered, cancelled: false }
	}
}
