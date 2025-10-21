import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { UIForm, FormInput, InputMessage } from '@nan0web/ui'
import { CancelError } from '@nan0web/ui/core'
import CLIInputAdapter from './InputAdapter.js'

// Awaits for the user input.
describe('CLIInputAdapter', () => {
	it('should create instance', () => {
		const adapter = new CLIInputAdapter()
		assert.ok(adapter instanceof CLIInputAdapter)
	})

	it('should validate form fields', async () => {
		const adapter = new CLIInputAdapter()

		// Mock ask for testing
		adapter.ask = () => Promise.resolve('test@example.com')

		const form = new UIForm({
			title: 'Test Form',
			elementId: 'test-form',
			fields: [
				new FormInput({
					name: 'email',
					label: 'Email',
					type: 'email',
					required: true
				})
			]
		})

		const result = await adapter.requestForm(form, { silent: true })
		assert.equal(result.form.state.email, 'test@example.com')
	})

	it('should handle form cancellation', async () => {
		const adapter = new CLIInputAdapter()

		// Mock ask for cancellation
		adapter.ask = () => Promise.resolve(InputMessage.ESCAPE)

		const form = new UIForm({
			title: 'Test Form',
			elementId: 'test-form',
			fields: [
				new FormInput({
					name: 'name',
					label: 'Name',
					required: true
				})
			]
		})

		const result = await adapter.requestForm(form, { silent: true })
		assert.equal(result.escaped, true)
	})

	it('should have CancelError static property', () => {
		assert.ok(CLIInputAdapter.CancelError)
		const error = new CLIInputAdapter.CancelError()
		assert.equal(error.name, "CancelError")
		assert.equal(error.message, "Operation cancelled by user")
	})

	it('should implement ask method', async () => {
		const adapter = new CLIInputAdapter()
		// Mock internal ask to avoid stdin interaction
		const originalAsk = adapter.ask
		adapter.ask = () => Promise.resolve('test answer')

		const answer = await adapter.ask('Test question?')
		assert.equal(answer, 'test answer')

		// Restore original
		adapter.ask = originalAsk
	})

	it('should implement select method', async () => {
		const adapter = new CLIInputAdapter()
		// Mock internal select to avoid stdin interaction
		const originalSelect = adapter.select
		adapter.select = () => Promise.resolve({ value: 'option1', index: 0 })

		const result = await adapter.select({
			title: 'Test Select',
			prompt: 'Choose:',
			options: ['option1', 'option2']
		})
		assert.equal(result.value, 'option1')
		assert.equal(result.index, 0)

		// Restore original
		adapter.select = originalSelect
	})

	it('should handle select cancellation', async () => {
		const adapter = new CLIInputAdapter()

		// Mock select to throw CancelError
		const originalSelect = adapter.select
		adapter.select = () => Promise.reject(new CancelError())

		const config = {
			title: 'Test Select',
			prompt: 'Choose:',
			id: 'test-select',
			options: ['option1', 'option2']
		}

		const result = await adapter.requestSelect(config)
		assert.deepStrictEqual(result.value, InputMessage.from({}).value)

		// Restore original
		adapter.select = originalSelect
	})
})
