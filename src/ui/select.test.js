import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { select } from './select.js'
import { CancelError } from '@nan0web/ui/core'

describe('Select utility', () => {
	it('should throw error for empty options', async () => {
		await assert.rejects(
			select({
				title: 'Test',
				prompt: 'Choose:',
				options: [],
				console: console
			}),
			Error
		)
	})

	it('should throw CancelError for cancellation', async () => {
		// Мокаємо ask для скасування
		const mockAsk = () => Promise.resolve({ cancelled: true })

		await assert.rejects(
			select({
				title: 'Test',
				prompt: 'Choose:',
				options: ['option1', 'option2'],
				console: console,
				ask: mockAsk
			}),
			CancelError
		)
	})
})
