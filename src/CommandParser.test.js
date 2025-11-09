import { describe, it } from 'node:test'
import assert from 'node:assert'
import CommandParser from './CommandParser.js'
import { Message } from '@nan0web/co'

class TestBody {
	/** @type {string} */
	name = ""
	/** @type {number} */
	age = 0
	/** @type {boolean} */
	active = false
	/**
	 * @param {Partial<TestBody>} [input={}]
	 */
	constructor(input = {}) {
		const {
			name = this.name,
			age = this.age,
			active = this.active,
		} = input
		this.name = String(name)
		this.age = Number(age)
		this.active = Boolean(active)
	}
}

class NestedBody {
	/** @type {string} */
	attr = ""

	static active = {
		alias: "a"
	}
	/** @type {boolean} */
	active = false

	static online = {
		alias: "o"
	}
	/** @type {boolean} */
	online = false
	/**
	 * @param {Partial<NestedBody>} [input={}]
	 */
	constructor(input = {}) {
		const {
			attr = this.attr,
			active = this.active,
			online = this.online,
		} = input
		this.attr = String(attr)
		this.active = Boolean(active)
		this.online = Boolean(online)
	}
}

/**
 * Nested test message
 */
class NestedTestMessage extends Message {
	static name = 'nested'
	static help = 'Nested test command'
	/**
	 * Leave this assignment for translations collection.
	 * @type {typeof NestedBody}
	 */
	static Body = NestedBody
	/** @type {NestedBody} */
	body
	/**
	 * @param {Partial<NestedTestMessage>} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		this.body = new NestedBody(input.body ?? {})
	}
}

/**
 * Test message for parsing
 */
class TestMessage extends Message {
	static name = 'test'
	static help = 'Test command'
	/**
	 * @type {typeof TestBody}
	 */
	static Body = TestBody
	static Children = [NestedTestMessage]
	/** @type {TestBody} */
	body
	/**
	 * @param {Partial<TestMessage>} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		this.body = new TestBody(input.body ?? {})
	}
}

describe('CommandParser', () => {
	it('should parse basic command with flags', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['--name', 'John', '--age', '30', '--active'])

		assert.strictEqual(result.body.name, 'John')
		assert.strictEqual(result.body.age, 30)
		assert.strictEqual(result.body.active, true)
	})

	it('should find nested commands', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['nested', '--attr', 'Child'])

		assert.ok(result instanceof NestedTestMessage)
		assert.strictEqual(result.body.attr, 'Child')
	})

	it('should throw error for unknown commands', () => {
		const parser = new CommandParser(TestMessage)

		assert.throws(() => {
			parser.parse(['definitely-unknown-command'])
		}, /Unknown command/)
	})

	it('should correctly convert types', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['--name', 'Alice', '--age', '28', '--active', 'false'])

		assert.strictEqual(typeof result.body.name, 'string')
		assert.strictEqual(typeof result.body.age, 'number')
		assert.strictEqual(typeof result.body.active, 'boolean')

		assert.strictEqual(result.body.name, 'Alice')
		assert.strictEqual(result.body.age, 28)
		assert.strictEqual(result.body.active, false)
	})

	it('should parse command with aliases', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['nested', '-a', '--attr', 'Aliased'])

		assert.ok(result instanceof NestedTestMessage)
		assert.strictEqual(result.body.active, true)
		assert.strictEqual(result.body.attr, 'Aliased')
	})

	it('should parse only alias without value as boolean', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['nested', '-a', '-o'])

		assert.ok(result instanceof NestedTestMessage)
		assert.strictEqual(result.body.active, true)
		assert.strictEqual(result.body.online, true)
	})

	it('should parse only alias glued together', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['nested', '-ao'])

		assert.ok(result instanceof NestedTestMessage)
		assert.strictEqual(result.body.active, true)
		assert.strictEqual(result.body.online, true)
	})

	it('should parse aliases along with full flags', () => {
		const parser = new CommandParser(TestMessage)
		const result = parser.parse(['nested', '--attr', 'FullFlag', '-o'])

		assert.ok(result instanceof NestedTestMessage)
		assert.strictEqual(result.body.attr, 'FullFlag')
		assert.strictEqual(result.body.online, true)
	})
})
