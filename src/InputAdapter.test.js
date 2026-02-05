import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { UiForm, FormInput } from '@nan0web/ui'
import { CancelError } from '@nan0web/ui/core'
import { Input } from './ui/input.js'
import CLiInputAdapter from './InputAdapter.js'
import { NoConsole } from '@nan0web/log'
import prompts from 'prompts'

describe('CLiInputAdapter', () => {
	let adapter

	beforeEach(() => {
		adapter = new CLiInputAdapter({ console: new NoConsole() })
	})

	it('should create instance', () => {
		assert.ok(adapter instanceof CLiInputAdapter)
	})

	it('should handle form submission', { timeout: 2000 }, async () => {
		const form = new UiForm({
			title: 'Test Form',
			id: 'test-form',
			fields: [
				new FormInput({ name: 'name', label: 'Name', required: true }),
				new FormInput({ name: 'age', label: 'Age', type: 'number' }),
			],
			validateValue: (name, val) => ({ isValid: true, errors: {} }),
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ size: 0 }),
			state: {},
		})

		prompts.inject(['John Doe', '30'])
		const result = await adapter.requestForm(form, { silent: true })

		assert.equal(result.cancelled, false)
		assert.equal(result.form.state.name, 'John Doe')
		assert.equal(result.form.state.age, '30')
	})

	it('should handle form cancellation', { timeout: 2000 }, async () => {
		const form = new UiForm({
			title: 'Test Form',
			id: 'test-form',
			fields: [new FormInput({ name: 'name', label: 'Name', required: true })],
			validateValue: (name, val) => ({ isValid: true, errors: {} }),
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ size: 0 }),
			state: {},
		})

		prompts.inject([undefined])
		const result = await adapter.requestForm(form, { silent: true })

		assert.equal(result.cancelled, true)
	})

	it('should handle requestSelect', { timeout: 2000 }, async () => {
		prompts.inject(['uk'])
		const config = {
			title: 'Choose Language:',
			options: new Map([
				['en', 'English'],
				['uk', 'Ukrainian'],
			]),
		}
		const result = await adapter.requestSelect(config)
		assert.equal(result.value, 'uk')
		assert.equal(result.cancelled, false)
	})

	it('should handle requestSelect cancellation', { timeout: 2000 }, async () => {
		prompts.inject([undefined])
		const config = { title: 'Test', options: ['opt'], id: 'test', prompt: 'Choose:' }
		const result = await adapter.requestSelect(config)
		assert.equal(result.value, undefined)
		assert.equal(result.cancelled, true)
	})

	it('should handle requestInput', { timeout: 2000 }, async () => {
		prompts.inject(['some value'])
		const result = await adapter.requestInput({ prompt: 'Input:', id: 'test' })
		assert.equal(result.value, 'some value')
		assert.equal(result.cancelled, false)
	})

	it('should render simple component fallback', { timeout: 2000 }, async () => {
		await adapter.render('Alert', { message: 'Hello' })
		assert.ok(true) // Should not throw
	})

	it('should load and render component from map', { timeout: 2000 }, async () => {
		const components = new Map([
			['Custom', async () => ({ default: (props) => props.adapter.console.info(props.text) })],
		])
		const console = new NoConsole()
		const customAdapter = new CLiInputAdapter({ console, components })
		await customAdapter.render('Custom', { text: 'custom render', adapter: customAdapter })
		assert.equal(console.output()[0][1], 'custom render')
	})

	it('should handle validation errors in form', { timeout: 2000 }, async () => {
		const form = {
			title: 'Test Form',
			fields: [{ name: 'name', label: 'Name', required: true }],
			validateValue: (name, val) => {
				if (val === 'invalid') return { isValid: false, errors: { name: 'Incorrect' } }
				return { isValid: true, errors: {} }
			},
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ size: 0 }),
			state: {},
		}

		prompts.inject(['invalid', 'valid'])
		await adapter.requestForm(form, { silent: true })

		// output[0] = "Name: invalid" (echo from requestInput)
		// output[1] = warn "\nIncorrect"
		// output[2] = "Name: valid" (echo from requestInput)
		const warns = adapter.console.output().filter((o) => o[0] === 'warn')
		assert.equal(warns[0][1], '\nIncorrect')
	})

	it('should trigger infinite loop detection', { timeout: 2000 }, async () => {
		const smallAdapter = new CLiInputAdapter({ maxRetries: 2, console: new NoConsole() })
		const form = {
			title: 'Loop Form',
			fields: [{ name: 'email', label: 'Email', required: true }],
			validateValue: () => ({ isValid: false, errors: { email: 'Always invalid' } }),
			setData: (data) => ({ ...form, state: data }),
			validate: () => ({ size: 0 }),
			state: {},
		}

		prompts.inject(['a', 'b', 'c', 'd'])
		const result = await smallAdapter.requestForm(form, { silent: true })
		assert.equal(result.cancelled, true)
		assert.equal(result.body.error, 'Infinite loop detected')
	})
})
