import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ProgressBar } from './progress.js'

describe('ProgressBar Unit Tests', () => {
	it('should render correct percentage', () => {
		const p = new ProgressBar({ total: 100, title: 'Loading', width: 10 })
		p.update(50)
		const output = p.renderToString()

		assert.ok(output.includes('50%'), 'Should show 50%')
		assert.ok(output.includes('[=====>----]'), 'Should show correct bar width')
	})

	it('should format time correctly', () => {
		const p = new ProgressBar({ total: 100 })
		assert.equal(p.formatTime(0), '00:00')
		assert.equal(p.formatTime(61), '01:01')
		assert.equal(p.formatTime(3661), '01:01:01')
		assert.equal(p.formatTime(Infinity), '--:--')
	})

	it('should render indeterminate bar when total is omitted', () => {
		const p = new ProgressBar({ title: 'Scanning' })
		p.update(150)
		const output = p.renderToString()
		assert.ok(output.includes('Scanning'), 'Should contain title')
		assert.ok(output.includes('150'), 'Should contain count')
		assert.ok(!output.includes('%'), 'Should not contain percent')
	})
})
