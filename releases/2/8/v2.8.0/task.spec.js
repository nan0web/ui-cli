import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// import { FormViewer } from '../../../src/ui/FormViewer.js'
// import { ContentViewer } from '../../../src/ui/ContentViewer.js'
// import { runGenerator, ask } from '@nan0web/ui'

describe('v2.8.0 Release Contract: Interactive Web-like Term-Forms', () => {

	describe('FormViewer (Menu-based editor)', () => {
		it('Story: As a User, I can start FormViewer in Aggressive Mode, answering each field sequentially without skipping', async () => {
			assert.fail('Not implemented: FormViewer sequential (aggressive) mode flow')
		})

		it('Story: As a User, I can start FormViewer in Passive Mode (Menu), viewing all fields at once, navigating with Tab/Arrows, and editing only specific fields', async () => {
			assert.fail('Not implemented: FormViewer passive menu editing flow')
		})

		it('Story: As a User, I can view the FormViewer in "Summary" mode as a single condensed line of values until focused', async () => {
			assert.fail('Not implemented: FormViewer single-line summary state')
		})
	})

	describe('ContentViewer (Markdown/AST interactive view)', () => {
		it('Story: As a User, I can scroll long content and press Tab to focus on inline links without breaking the application', async () => {
			assert.fail('Not implemented: ContentViewer passive navigation & focus')
		})

		it('Story: As a User, I can Tab to an inline (Sub-Model) form that is $collapsed, format expands upon Enter, allowing me to fill it, and collapses back', async () => {
			assert.fail('Not implemented: ContentViewer inline Sub-Form activation and resumption')
		})
	})
})
