import { describe, it } from 'node:test'
import assert from 'node:assert'
import PlaygroundTest from './PlaygroundTest.js'

describe('PlaygroundTest class', () => {
	it('should filter debugger lines when includeDebugger is false', () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		const input = [
			'normal output',
			'debugger;',
			'https://nodejs.org/en/docs/inspector',
			'another line',
		].join('\n')
		const filtered = pt.filterDebugger(input)
		assert.strictEqual(filtered, 'normal output\nanother line')
	})

	it('should keep debugger lines when includeDebugger is true', () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: true })
		const input = ['debugger;', 'https://nodejs.org/en/docs/inspector', 'normal output'].join('\n')
		const filtered = pt.filterDebugger(input)
		assert.strictEqual(filtered, input)
	})

	it('slice should return correct lines from recentResult', () => {
		const pt = new PlaygroundTest(process.env)
		pt.recentResult = {
			stdout: ['line1', 'line2', 'line3', 'line4'].join('\n'),
			stderr: '',
			exitCode: 0,
		}
		const sliced = pt.slice('stdout', 1, 3)
		assert.deepStrictEqual(sliced, ['line2', 'line3'])
	})
})
