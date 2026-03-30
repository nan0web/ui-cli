import { Model } from '@nan0web/types'

/**
 * Model describing the ContentViewer component parameters.
 */
export class ContentViewerModel extends Model {
	static UI = { alias: ['content', 'children', 'label', 'labels'], default: '' }
	static UI_TITLE = { alias: ['title', 'message'], default: 'Viewer' }
	static help = 'Scrollable markdown content viewer.'

	/**
	 * @param {Partial<ContentViewerModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The content to display. */ this.UI
		/** @type {string} The title of the viewer. */ this.UI_TITLE
	}
}
