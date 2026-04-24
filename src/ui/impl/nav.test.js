import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { breadcrumbs, tabs, steps } from './nav.js'

describe('Navigation Components Unit Tests', () => {

	it('breadcrumbs() should join items with separator', () => {
		const res = breadcrumbs(['A', 'B'], { separator: '>' })
		assert.ok(res.includes('A'))
		assert.ok(res.includes('B'))
		assert.ok(res.includes('>'))
	})

	it('tabs() should highlight active tab', () => {
		const res = tabs(['T1', 'T2'], 0)
		assert.ok(res.includes('T1'))
		assert.ok(res.includes('T2'))
        assert.ok(res.includes('│'))
	})

	it('steps() should show progress indicators', () => {
		const res = steps(['S1', 'S2', 'S3'], 1)
		assert.ok(res.includes('✔ S1')) // Completed
		assert.ok(res.includes('● S2')) // Current
		assert.ok(res.includes('○ S3')) // Future
	})
})
