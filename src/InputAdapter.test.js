import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import CLIInputAdapter from './InputAdapter.js'
import UIForm from '@nan0web/ui/core/Form/Form.js'
import FormInput from '@nan0web/ui/core/Form/Input.js'

describe('CLIInputAdapter', () => {
	it('should create instance', () => {
		const adapter = new CLIInputAdapter()
		assert.ok(adapter instanceof CLIInputAdapter)
	})

	it('should validate form fields', async () => {
		const adapter = new CLIInputAdapter()
		
		// Мокаємо ask для тестування
		const originalAsk = adapter.constructor.prototype.ask
		adapter.constructor.prototype.ask = () => Promise.resolve('test@example.com')
		
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
		assert.equal(result.action, 'form-submit')
		assert.equal(result.data.email, 'test@example.com')
		
		// Відновлюємо оригінал
		adapter.constructor.prototype.ask = originalAsk
	})

	it('should handle form cancellation', async () => {
		const adapter = new CLIInputAdapter()
		
		// Мокаємо ask для скасування
		const originalAsk = adapter.constructor.prototype.ask
		adapter.constructor.prototype.ask = () => Promise.resolve('')
		
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
		assert.equal(result.action, 'form-cancel')
		
		// Відновлюємо оригінал
		adapter.constructor.prototype.ask = originalAsk
	})
})