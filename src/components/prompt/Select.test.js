import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Select } from './Select.js'
import prompts from 'prompts'

describe('Select Component', () => {
	it('renders and returns selection', async () => {
		// Inject selection (value 'b')
		prompts.inject(['b'])

		const component = Select({
			message: 'Choose',
			options: [
				{ title: 'A', value: 'a' },
				{ title: 'B', value: 'b' },
			],
		})

		assert.equal(component.type, 'Select')

		const result = await component.execute()
		assert.equal(result.value, 'b')
	})
})
