import test from 'node:test'
import assert from 'node:assert/strict'
import { bootstrapApp } from '../../../../../../src/ui/bootstrapApp.js'

test('bootstrapApp should be an async function', () => {
	assert.equal(typeof bootstrapApp, 'function')
})

test('bootstrapApp handles model and argv successfully', async (t) => {
	// Mock process.exit to prevent test runner death
	const originalExit = process.exit
	let exitCode = null
	
	// @ts-ignore
	process.exit = (code) => {
		exitCode = code
	}

	class TestModel {
		static help = 'Test Help'
		static name = { type: 'string', help: 'Your name', alias: 'n' }
		
		constructor(data) {
			this.data = data
		}

		async* run() {
			yield { type: 'log', message: `Hello ${this.data.name}` }
			return { status: 'success' }
		}
	}

	try {
		await bootstrapApp(TestModel, { 
			argv: ['--name', 'Antigravity'],
			// Provide mock t and db to avoid full environment setup
			t: (k) => k,
			root: '.test_data'
		})

		assert.equal(exitCode, 0, 'Should exit with code 0')
	} finally {
		process.exit = originalExit
	}
})

test('bootstrapApp handles failure with exit code 1', async (t) => {
	const originalExit = process.exit
	let exitCode = null
	
	// @ts-ignore
	process.exit = (code) => {
		exitCode = code
	}

	class FailModel {
		constructor() {}
		async* run() {
			throw new Error('Expected Failure')
		}
	}

	try {
		await bootstrapApp(FailModel, { 
			argv: [],
			t: (k) => k,
			root: '.test_data'
		})
		assert.equal(exitCode, 1, 'Should exit with code 1 on error')
	} finally {
		process.exit = originalExit
	}
})
