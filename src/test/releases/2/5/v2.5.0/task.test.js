import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('v2.5.0 — Event-Driven PlaygroundTest', () => {
	it('PlaygroundTest constructor supports event driven feeding', async () => {
		const { PlaygroundTest } = await import('../../../../src/test/index.js')
		const pt = new PlaygroundTest({})
		assert.equal(typeof pt.run, 'function', 'PlaygroundTest must export run method')
	})
})
