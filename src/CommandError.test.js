import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandError from './CommandError.js'

describe('CommandError', () => {
	it('should create error with message', () => {
		const error = new CommandError('Test error')
		assert.equal(error.message, 'Test error')
		assert.equal(error.name, 'CommandError')
	})

	it('should create error with data', () => {
		const data = { code: 'TEST_ERROR' }
		const error = new CommandError('Test error', data)
		assert.equal(error.data, data)
	})

	it('should convert to string with data', () => {
		const data = { code: 'TEST_ERROR' }
		const error = new CommandError('Test error', data)
		const str = error.toString()
		assert.ok(str.includes('Test error'))
		assert.ok(str.includes('"code": "TEST_ERROR"'))
	})

	it('should convert to string without data', () => {
		const error = new CommandError('Test error')
		const str = error.toString()
		assert.equal(str, 'Test error')
	})
})