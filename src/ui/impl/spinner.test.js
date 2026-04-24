import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Spinner } from './spinner.js'

describe('Spinner Unit Tests', () => {
	it('should initialize with config', () => {
		const s = new Spinner({ message: 'Wait', fps: 10 })
		assert.equal(s.message, 'Wait')
		assert.equal(s.fps, 10)
	})

	it('should render correct string representation', () => {
		const s = new Spinner({ message: 'Loading' })
		const str = s.renderToString()
		assert.ok(str.includes('⠋ Loading'), 'Should contain frame and message')
		assert.ok(str.includes('[00:00]'), 'Should contain initial time')
	})

	it('should cycle through frames', () => {
		const s = new Spinner({ message: 'Loading' })
		const frame1 = s.renderToString().split(' ')[1]
		const frame2 = s.renderToString().split(' ')[1]
		assert.equal(frame1, '⠋')
		assert.equal(frame2, '⠙')
	})

	it('should change message dynamically', () => {
		const s = new Spinner({ message: 'Initial' })
		s.update('Updated')
		const str = s.renderToString()
		assert.ok(str.includes('Updated'), 'Should contain updated message')
	})

	it('should render success checkmark', () => {
		const s = new Spinner({ message: 'Done' })
		s.success()
		const str = s.renderToString()
		assert.ok(str.includes('✔ Done'), 'Should contain success mark')
	})

	it('should render error cross', () => {
		const s = new Spinner({ message: 'Fail' })
		s.error('Failed completely')
		const str = s.renderToString()
		assert.ok(str.includes('✖ Failed completely'), 'Should contain error mark and new message')
	})
})
