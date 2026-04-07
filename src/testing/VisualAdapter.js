import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'

/**
 * VisualAdapter (CLI)
 *
 * Рендерить "Логічні зліпки" у візуальні CLI-подібні блоки Markdown (Snapshot format).
 */
export class VisualAdapter extends BaseVisualAdapter {
	/** @type {Map<string, Function>} */
	static #renderers = new Map()

	/**
	 * @param {string} component
	 * @param {Function} renderer
	 */
	static registerRenderer(component, renderer) {
		this.#renderers.set(component, renderer)
	}

	/**
	 * Конвертує одну інтенцію у візуальний блок Markdown.
	 * @param {object} intent - Intent entry from LogicInspector
	 * @param {function} t - i18n translate function
	 * @param {object} [options] - Rendering options
	 * @returns {string} Markdown ANSI-style text block
	 */
	static render(intent, t = (k) => k, options = {}) {
		if (intent.type === 'ask') {
			const help = intent.schema?.help || intent.schema?.title
			let res = `\n> **${t('[ASK]')}** \`${intent.field}\` (${help ? t(help) : ''})\n`
			if (intent.schema?.options) {
				res += '```text\n'
				intent.schema.options.forEach((opt) => {
					const prefix = opt.value === intent.input ? ' [x] ' : ' [ ] '
					res += `${prefix}${opt.label}\n`
				})
				res += '```\n'
			} else {
				res += `\`[ ${intent.input || '...'} ]\`\n`
			}
			return res
		}

		if (intent.type === 'log') {
			let res = `\n**${t('[LOG]')} ${intent.level.toUpperCase()}**\n`
			if (intent.message?.component === 'BranchDetails') {
				res += '```yaml\n'
				res += `--- branch details ---\n`
				res += `City: ${intent.message.city}\n`
				res += `Address: ${intent.message.address}\n`
				res += `----------------------\n`
				res += '```\n'
			} else {
				res += `> ${typeof intent.message === 'string' ? t(intent.message) : JSON.stringify(intent.message)}\n`
			}
			return res
		}

		if (intent.type === 'render') {
			const custom = this.#renderers.get(intent.component)
			let res = ''

			if (custom) {
				const out = custom(intent.props, t)
				res += `\n\`\`\`text\n${out}\n\`\`\`\n`
			}

			if (options.full || !custom) {
				res += `\n**${t('[RENDER VIEW]')}** \`${intent.component}\`\n`
				if (intent.props && Object.keys(intent.props).length > 0) {
					res += '```json\n'
					res += JSON.stringify(intent.props, null, 2) + '\n'
					res += '```\n'
				}
			}
			return res
		}

		if (intent.type === 'progress') {
			return `\n*${t('[PROCESSING]')}... ${intent.message}*\n`
		}

		return ''
	}
}
