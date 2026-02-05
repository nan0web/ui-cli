import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { select } from './select.js'
import { CancelError } from '@nan0web/ui/core'
import prompts from 'prompts'

describe('Select utility', () => {
	it('throws on empty options', async () => {
		await assert.rejects(() => select({ title: 'Test', prompt: 'Choose:', options: [] }), {
			message: 'Options array is required and must not be empty',
		})
	})

	it('handles Map options', async () => {
		// Mock user selecting 'en'
		prompts.inject(['en'])

		const result = await select({
			title: 'Lang',
			prompt: 'Choose:',
			options: new Map([
				['en', 'English'],
				['uk', 'Ukrainian'],
			]),
		})
		assert.equal(result.value, 'en')
		assert.equal(result.index, 0)
	})

	it('returns correct index and value for Array options', async () => {
		prompts.inject(['uk'])
		const result = await select({
			title: 'Lang',
			prompt: 'Choose:',
			options: ['en', 'uk'],
		})
		assert.equal(result.value, 'uk')
		assert.equal(result.index, 1)
	})
})
