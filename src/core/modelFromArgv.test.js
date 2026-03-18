import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { modelFromArgv } from './modelFromArgv.js'

class TestModel {
	static source = { help: 'Source path', default: '.', positional: true }
	static target = { help: 'Target dir', default: 'out', positional: true }
	static from = { help: 'From language', default: 'uk' }
	static to = { help: 'To language', default: 'en' }
	static quiet = { help: 'Quiet mode', default: false, type: 'boolean', alias: 'q' }
	static limit = { help: 'Limit', default: '10' }

	source = TestModel.source.default
	target = TestModel.target.default
	from = TestModel.from.default
	to = TestModel.to.default
	quiet = TestModel.quiet.default
	limit = TestModel.limit.default

	constructor(data = {}) {
		for (const key in data) {
			if (data[key] === undefined) delete data[key]
		}
		Object.assign(this, { ...this, ...data })
	}
}

describe('modelFromArgv', () => {
	it('creates model with all defaults when no argv given', () => {
		const model = modelFromArgv(TestModel, [])
		assert.equal(model.source, '.')
		assert.equal(model.target, 'out')
		assert.equal(model.from, 'uk')
		assert.equal(model.to, 'en')
		assert.equal(model.quiet, false)
	})

	it('maps positional args to positional: true fields', () => {
		const model = modelFromArgv(TestModel, ['src/', 'dist/'])
		assert.equal(model.source, 'src/')
		assert.equal(model.target, 'dist/')
	})

	it('parses named --options', () => {
		const model = modelFromArgv(TestModel, ['--from', 'de', '--to', 'fr'])
		assert.equal(model.from, 'de')
		assert.equal(model.to, 'fr')
	})

	it('parses short alias -q for boolean', () => {
		const model = modelFromArgv(TestModel, ['-q'])
		assert.equal(model.quiet, true)
	})

	it('combines positional + named + short', () => {
		const model = modelFromArgv(TestModel, [
			'docs/uk/**/*.md', 'docs/en',
			'--from', 'uk',
			'--to', 'en_GB',
			'-q',
		])
		assert.equal(model.source, 'docs/uk/**/*.md')
		assert.equal(model.target, 'docs/en')
		assert.equal(model.from, 'uk')
		assert.equal(model.to, 'en_GB')
		assert.equal(model.quiet, true)
	})

	it('named options take priority over positionals', () => {
		const model = modelFromArgv(TestModel, [
			'from-positional',
			'--source', 'from-named',
		])
		assert.equal(model.source, 'from-named')
	})

	it('returns an instance of the Model class', () => {
		const model = modelFromArgv(TestModel, [])
		assert.ok(model instanceof TestModel)
	})

	it('handles only positionals without named options', () => {
		const model = modelFromArgv(TestModel, ['a', 'b'])
		assert.equal(model.source, 'a')
		assert.equal(model.target, 'b')
		assert.equal(model.from, 'uk')
	})
})
