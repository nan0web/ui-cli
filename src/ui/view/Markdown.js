import { renderMarkdown } from '../impl/markdown.js'

/**
 * Renders static Markdown content block.
 * @param {{ content?: string|Array, message?: string|Array }} props
 * @returns {string}
 */
export function Markdown(props = {}) {
	const text = props.content || props.message || ''
	return `\n${renderMarkdown(text)}\n`
}
