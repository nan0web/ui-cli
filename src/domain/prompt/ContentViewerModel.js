import { Model } from '@nan0web/types'

/**
 * Model describing the ContentViewer component parameters.
 */
export class ContentViewerModel extends Model {
	static UI = {
		title: 'Viewer',
		focus: 'Focus',
		scroll: 'Scroll',
		back: 'Back',
		select: 'Select'
	}
	
	static content = { alias: ['children', 'label', 'labels'], default: '' }
	static title = { alias: ['message'], default: 'Viewer' }
	static print = { type: 'boolean', default: false }
	static help = 'Scrollable markdown content viewer.'

	/**
	 * @param {Partial<ContentViewerModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} The content to display. */ this.content
		/** @type {string} The title of the viewer. */ this.title
		/** @type {boolean} Print directly. */ this.print
	}
}
