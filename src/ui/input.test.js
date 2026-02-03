import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Input, ask, createInput } from './input.js'

describe('Input utilities', () => {
	it('should create Input instance', () => {
		const input = new Input()
		assert.equal(input.value, '')
		assert.equal(input.cancelled, false)
	})

	it('should handle cancellation stops', () => {
		const input = new Input({ stops: ['quit'] })
		input.value = 'quit'
		assert.equal(input.cancelled, true)
	})

	it('should create input handler', () => {
		const handler = createInput()
		assert.equal(typeof handler, 'function')
	})

	it('should create input handler with stops', () => {
		const handler = createInput(['exit'])
		assert.equal(typeof handler, 'function')
	})
})
