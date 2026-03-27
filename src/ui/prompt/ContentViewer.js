import { createPrompt } from '../core/Component.js'
import { markdownViewer } from '../impl/markdown.js'
import { ContentViewerModel } from '../../domain/prompt/ContentViewerModel.js'

export { ContentViewerModel }

/**
 * Scrollable markdown content viewer.
 * @param {Object|string} props - Configuration or raw content.
 */
export function ContentViewer(props) {
	const model = new ContentViewerModel(props)
	return createPrompt('ContentViewer', model, (p) => {
		return markdownViewer({
			...p,
			content: p.UI,
			title: p.t ? p.t(p.UI_TITLE) : p.UI_TITLE
		})
	})
}
