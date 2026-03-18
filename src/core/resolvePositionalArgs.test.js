import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePositionalArgs } from './resolvePositionalArgs.js'

describe('resolvePositionalArgs', () => {
	class TestModel {
		static source = { help: 'Source', default: '.', positional: true }
		static target = { help: 'Target', default: 'out', positional: true }
		static verbose = { help: 'Verbose', default: false, type: 'boolean' }
		static from = { help: 'From', default: 'uk' }
	}

	it('maps positional args to fields with positional: true', () => {
		const result = resolvePositionalArgs(TestModel, ['src/', 'dist/'])
		assert.equal(result.source, 'src/')
		assert.equal(result.target, 'dist/')
	})

	it('preserves declaration order (source before target)', () => {
		const result = resolvePositionalArgs(TestModel, ['first', 'second'])
		assert.equal(result.source, 'first')
		assert.equal(result.target, 'second')
	})

	it('named options take priority over positionals', () => {
		const result = resolvePositionalArgs(TestModel, ['from-args', 'from-args-dir'], {
			source: 'explicit.md',
		})
		assert.equal(result.source, 'explicit.md')
		assert.equal(result.target, 'from-args-dir')
	})

	it('handles partial args (only first positional)', () => {
		const result = resolvePositionalArgs(TestModel, ['only-source'])
		assert.equal(result.source, 'only-source')
		assert.equal(result.target, undefined)
	})

	it('handles empty args (returns existing)', () => {
		const result = resolvePositionalArgs(TestModel, [], { from: 'de' })
		assert.equal(result.from, 'de')
		assert.equal(result.source, undefined)
	})

	it('handles no args at all', () => {
		const result = resolvePositionalArgs(TestModel)
		assert.deepEqual(result, {})
	})

	it('ignores extra args beyond declared positional fields', () => {
		const result = resolvePositionalArgs(TestModel, ['a', 'b', 'c', 'd'])
		assert.equal(result.source, 'a')
		assert.equal(result.target, 'b')
		assert.equal(result.c, undefined)
	})

	it('skips non-positional fields (verbose, from)', () => {
		const fields = Object.entries(TestModel)
			.filter(([, v]) => v?.positional === true)
			.map(([k]) => k)
		assert.deepEqual(fields, ['source', 'target'])
	})
})
