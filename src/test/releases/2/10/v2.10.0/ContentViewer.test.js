import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ContentViewer } from '../../../../../ui/prompt/ContentViewer.js'
import prompts from '../../../../../ui/impl/prompts.js'

describe('ContentViewer Component', () => {
	it('renders and allows navigation through links', async () => {
		const oldSnapshot = process.env.UI_SNAPSHOT
		process.env.UI_SNAPSHOT = '1'
		
		try {
			// Mock input: Select first interactive element
			prompts.inject([0])

			const component = ContentViewer({
				content: 'Hello world!\n[Example Link](https://example.com)',
				title: 'Test Viewer'
			})

			assert.equal(component.type, 'ContentViewer')

			const result = await component.execute()
			assert.equal(result.value.url, 'https://example.com')
		} finally {
			process.env.UI_SNAPSHOT = oldSnapshot
		}
	})

	it('handles inline forms with real interaction', async () => {
		const oldSnapshot = process.env.UI_SNAPSHOT
		process.env.UI_SNAPSHOT = '1'

		try {
			class FeedbackForm {
				static rating = { type: 'select', help: 'How much do you like it?', options: ['Great', 'Good', 'Bad'] }
				static comment = { type: 'text', help: 'Your comment' }
				constructor(data = {}) { 
					Object.assign(this, data)
					this.$id = 'feedback'
					this.title = 'Feedback Form'
				}
			}

			const model = new FeedbackForm()

			// Inject: 
			// 1. 'feedback' to open the form
			// 2. 'Good' (selects 'Good' for rating)
			// 3. 'Great-job' (input for the text field)
			prompts.inject(['feedback', 'Good', 'Great-job'])

			const component = ContentViewer({
				content: [
					{ type: 'MDParagraph', content: 'Testing form injection:' },
					model
				],
				title: 'Full Meta Test'
			})

			const result = await component.execute()
			
			// Verify formSubmit intent structure
			assert.equal(result.action, 'formSubmit')
			assert.equal(result.context, 'content-viewer')
			assert.equal(result.id, 'feedback')
			assert.equal(result.url, '#feedback')
			
			// Verify payload contains the user input for all fields
			// Note: Form engine works on a state copy (OLMUI principle),
			// original model is NOT mutated — payload is the source of truth
			assert.ok(result.payload, 'payload must exist')
			assert.equal(result.payload.rating, 'Good')
			assert.equal(result.payload.comment, 'Great-job')
		} finally {
			process.env.UI_SNAPSHOT = oldSnapshot
		}
	})
})
