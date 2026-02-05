import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Input } from './Input.js'
import prompts from 'prompts'

describe('Input Component', () => {
	it('renders and returns text value', async () => {
		prompts.inject(['Hello World'])

		const component = Input({
			message: 'Say hello',
			initial: 'Hi',
		})

		assert.equal(component.type, 'Input')

		const result = await component.execute()
		assert.equal(result.value, 'Hello World')
	})
})
