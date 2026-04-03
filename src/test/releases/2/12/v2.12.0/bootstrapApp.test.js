import { test } from 'node:test'
import assert from 'node:assert'
import { bootstrapApp } from '../../../../../ui/bootstrapApp.js'

test('bootstrapApp: Secure Protocol - MUST throw TypeError if db.seal is missing', async () => {
	const MockModel = class {
		async *run() { yield { done: true } }
	}
	const mockDb = {
		mount: () => {},
		connect: async () => {},
		loadDocument: async () => ({ name: 'test-app' }),
		seal: undefined // MISSING!
	}
	
	try {
		await bootstrapApp(MockModel, { db: mockDb, argv: [], noExit: true })
		assert.fail('Should have thrown TypeError')
	} catch (err) {
		const e = /** @type {TypeError} */ (err)
		assert.strictEqual(e.name, 'TypeError')
		assert.match(e.message, /db\.seal is not a function/)
	}
})

test('bootstrapApp: Secure Protocol - MUST call db.seal() after connects', async () => {
	let sealed = false
	const MockModel = class {
		async *run() { yield { done: true } }
	}
	const mockDb = {
		mount: () => {},
		connect: async () => {},
		loadDocument: async () => ({ name: 'test-app' }),
		seal: () => { sealed = true }
	}
	
	try {
		await bootstrapApp(MockModel, { db: mockDb, argv: [], noExit: true })
	} catch (e) {
		// Ignore bootstrapping errors for now, we only care about seal()
	}
	
	assert.strictEqual(sealed, true, 'db.seal() should have been called')
})



