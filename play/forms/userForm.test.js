import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createUserForm } from './userForm.js'

describe('userForm', () => {
	it('should create user form with proper fields', () => {
		const t = (key) => key // mock translation function
		const form = createUserForm(t)
		
		assert.equal(form.title, 'User Registration Form')
		assert.equal(form.id, 'user-registration')
		assert.equal(form.fields.length, 3)
		
		const [nameField, emailField, phoneField] = form.fields
		assert.equal(nameField.name, 'name')
		assert.equal(nameField.label, 'Full name')
		assert.equal(nameField.required, true)
		
		assert.equal(emailField.name, 'email')
		assert.equal(emailField.label, 'Email address')
		assert.equal(emailField.type, FormInput.TYPES.EMAIL)
		assert.equal(emailField.required, true)
		
		assert.equal(phoneField.name, 'phone')
		assert.equal(phoneField.label, 'Phone number')
		assert.equal(phoneField.type, FormInput.TYPES.TEXT)
		assert.equal(phoneField.required, false)
	})
})