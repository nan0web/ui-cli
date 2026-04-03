import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bootstrapApp } from '../../../../../ui/bootstrapApp.js'

test('v2.12.0 Contract: bootstrapApp MUST throw TypeError if db.seal is missing', async () => {
	const MockModel = class {
		async *run() { yield { done: true } }
	}
	const mockDb = {
		mount: () => {},
		connect: async () => {},
		loadDocument: async () => ({ name: 'test-app' }),
		seal: undefined 
	}
	
	await assert.rejects(
		async () => await bootstrapApp(MockModel, { db: mockDb, argv: [], noExit: true }),
		{
			name: 'TypeError',
			message: /db\.seal is not a function/
		}
	)
})

test('v2.12.0 Contract: bootstrapApp MUST call db.seal() after connects', async () => {
	let sealed = false
	const MockModel = class {
		async *run() { yield { done: true } }
	}
	const mockDb = {
		mount: () => {},
		connect: async () => {},
		loadDocument: async () => ({ name: 'test-app' }),
		seal: () => { sealed = true },
		resolveSync: () => null,
		resolve: async () => null
	}
	
	try {
		await bootstrapApp(MockModel, { db: mockDb, argv: [], noExit: true })
	} catch (e) {
		// Ignore bootstrapping errors for now, we only care about seal()
	}
	
	assert.strictEqual(sealed, true, 'db.seal() should have been called')
})
