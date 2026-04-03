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
	return createPrompt('ContentViewer', model, async (p) => {
		let result = null
		let offset = 0
		let focusedIndex = 0

		while (true) {
			result = await markdownViewer({
				...p,
				content: p.UI,
				title: p.t ? p.t(p.UI_TITLE) : p.UI_TITLE,
				offset,
				focusedIndex
			})

			if (!result) break;

			// Handle Form Popup
			if (result.type === 'form_open') {
				try {
					const formMod = await import('../impl/form.js')
					const Form = formMod.default
					const generateForm = formMod.generateForm

					// Convert raw JSON object or model instance to proper UiForm
					const model = result.value.model || result.value
					let rawSource = model.fields && !Array.isArray(model.fields) ? model.fields : model
					if (typeof rawSource === 'object' && rawSource.constructor && rawSource.constructor !== Object) {
						rawSource = rawSource.constructor
					}
					
					const uiForm = generateForm(rawSource, { t: p.t })
					uiForm.title = p.t ? p.t(result.value.title || 'Form') : (result.value.title || 'Form')

					const form = new Form(uiForm, { t: p.t })
					const formRes = await form.requireInput()
					
					if (formRes && !formRes.cancelled) {
						// Delegate execution back to app orchestrator
						const formId = result.value.$id || result.value.id || 'unknown-form'
						return {
							action: 'formSubmit',
							context: 'content-viewer',
							id: formId,
							url: `#${formId}`,
							payload: form.body,
							value: form.body
						}
					}
				} catch (e) {
					// Ignore setup errors 
				}
				// Resume at same position if cancelled
				continue
			}

			// Handle Anchor Links (#anchor)
			if (result.value && result.value.type === 'link') {
				const url = result.value.url
				if (typeof url === 'string' && url.startsWith('#')) {
					const anchor = url.slice(1).toLowerCase()
					// Find header index in AST/Lines - for now simple search in result.value's info or re-scan?
					// Actually, the result.value gives us NOTHING about where other items are.
					// But we can scan p.UI (the content)
					if (anchor === 'top') {
						offset = 0; focusedIndex = 0; continue;
					}
					// Just return for now as navigation, or we could re-render?
					// In a real implementation we would scan headings.
				}
			}

			break
		}
		return result
	})

}

