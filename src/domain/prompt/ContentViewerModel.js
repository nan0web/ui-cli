/**
 * Model describing the ContentViewer component parameters.
 */
export class ContentViewerModel {
	static UI = ''
	static help = 'Scrollable markdown content viewer.'
	static UI_TITLE = 'Viewer'

	/**
	 * @param {Object|string} props 
	 */
	constructor(props = {}) {
		if (typeof props === 'string') props = { UI: props }
		Object.assign(this, props)
		this.UI = props.UI || props.content || props.children || ContentViewerModel.UI
		this.UI_TITLE = props.UI_TITLE || props.title || props.message || ContentViewerModel.UI_TITLE
	}
}
