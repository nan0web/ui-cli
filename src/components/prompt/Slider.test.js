import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import prompts from 'prompts'

import { Slider } from './Slider.js'

describe('Slider Component', () => {
	it('renders and returns value', async () => {
		// Inject answer for the underlying prompts call
		// In test mode, slider uses a text prompt, so we inject a string
		prompts.inject(['50'])

		const component = Slider({ message: 'Volume', min: 0, max: 100 })

		assert.equal(component.type, 'Slider')

		// Execute the component's logic
		const result = await component.execute()

		// The fallback in slider.js returns a number
		assert.equal(result.value, 50)
	})
})
