import { Model } from '@nan0web/types'

/**
 * Model describing the Select component (Radio-button list).
 */
export class SelectModel extends Model {
	static UI = { alias: ['message', 'label', 'labels'], default: 'Select an option' }
	static help = { default: 'Standard radio-button selection list.' }
	static UI_HINT = { alias: 'hint', default: 'Use arrow-keys. Enter to select. TAB for search.' }
	static UI_MORE = { default: 'more' }
	static UI_RESULT = { default: 'Result' }
	static UI_PROMPT = { default: 'Select field to edit:' }
	static initial = { default: 0 }
	static options = { default: [] }

	/**
	 * @param {Partial<SelectModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The message or label. */ this.UI
		/** @type {string} Hint text. */ this.UI_HINT
		/** @type {string} More label. */ this.UI_MORE
		/** @type {string} Result label. */ this.UI_RESULT
		/** @type {string} Prompt label. */ this.UI_PROMPT
		/** @type {number} Initial index. */ this.initial
		/** @type {Array<any>} Options array. */ this.options
	}

	/**
	 * Map a predefined string answer to a selection result.
	 *
	 * @param {string} predefined - Injected answer.
	 * @returns {{value: any, index: number, cancelled: boolean}}
	 */
	automatedInput(predefined) {
		const options = this.options || []
		let choices = []
		if (options instanceof Map) {
			choices = Array.from(options.entries()).map(([value, label]) => ({ label, value }))
		} else if (Array.isArray(options)) {
			choices = options.map((el) => {
				if (typeof el === 'string') return { label: el, value: el }
				return { label: el.label || el.title || el.name, value: el.value }
			})
		}

		const idx = Number(predefined) - 1
		let index = -1
		let value = predefined

		if (!isNaN(idx) && idx >= 0 && idx < choices.length) {
			index = idx
			value = choices[idx].value
		} else {
			index = choices.findIndex(
				(c) =>
					String(c.label).toLowerCase().includes(String(predefined).toLowerCase()) ||
					String(c.value).toLowerCase() === String(predefined).toLowerCase()
			)
			if (index !== -1) value = choices[index].value
		}

		return { value, index, cancelled: false }
	}
}
