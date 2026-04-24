import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { badge } from './badge.js'
import { alert } from './alert.js'
import { toast } from './toast.js'

describe('Visual Components Unit Tests', () => {

	it('badge() should return styled string', () => {
		const res = badge('INFO', 'info')
		assert.ok(res.includes('INFO'))
	})

	it('alert() should format multiline messages', () => {
		const res = alert('Line 1\nLine 2', 'warning', { title: 'Alert', sound: false })
		assert.ok(res.includes('Alert'))
		assert.ok(res.includes('Line 1'))
		assert.ok(res.includes('Line 2'))
		assert.ok(res.includes('⚠'))
	})

	it('toast() should return single line notification', () => {
		const res = toast('Saved', 'success')
		assert.ok(res.includes('Saved'))
		assert.ok(res.includes('✔'))
        assert.ok(!res.includes('\n'), 'Toast should be a single line')
	})
})
