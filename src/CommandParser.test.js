import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Message } from '@nan0web/co'
import CommandParser from './CommandParser.js'

class TestBody {
	/** @type {string} */
	name = ''
	/** @type {number} */
	age = 0
	/** @type {boolean} */
	active = false

	/**
	 * @param {Partial<TestBody>} [input={}]
	 */
	constructor(input = {}) {
		const { name = this.name, age = this.age, active = this.active } = input
		this.name = String(name)
		this.age = Number(age)
		this.active = Boolean(active)
	}
}

class NestedBody {
	/** @type {string} */
	attr = ''

	static active = {
		alias: 'a',
		default: false,
	}
	/** @type {boolean} */
	active = false

	static online = {
		alias: 'o',
		default: false,
	}
	/** @type {boolean} */
	online = false
	/**
	 * @param {Partial<NestedBody>} [input={}]
	 */
	constructor(input = {}) {
		const { attr = this.attr, active = this.active, online = this.online } = input
		this.attr = String(attr)
		this.active = Boolean(active)
		this.online = Boolean(online)
	}
}

/**
 * Nested test message
 * @extends {Message}
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
 * @extends {Message}
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

class MainBody {
	static config = {
		help: 'Path to config file (optional)',
	}
	config = ''
	static data = {
		help: 'Data directory path or connection string',
	}
	data = './data'
	static public = {
		help: 'Public assets directory',
	}
	public = './public'
	static dist = {
		help: 'Output directory for SSG',
	}
	dist = './dist'
	static port = {
		help: 'API server port',
	}
	port = 8888
	static yes = {
		help: 'Non-interactive mode (yes to all prompts)',
	}
	yes = false
	static no = {
		help: '',
	}
	no = false
}

class Main extends Message {
	static Body = MainBody
	/** @type {MainBody} */
	body
	/**
	 * @param {import('@nan0web/co').MessageInput & { body: MainBody }} input
	 */
	constructor(input = {}) {
		super(input)
		this.body = new MainBody(input.body ?? {})
	}
	/**
	 *
	 * @param {any} input
	 * @returns {Main}
	 */
	static from(input) {
		if (input instanceof Main) return input
		return new Main(input)
	}
}

describe('CommandParser', () => {
	it('should parse basic command with flags', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', '--name', 'John', '--age', '30', '--active'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.strictEqual(result.body.name, 'John')
		assert.strictEqual(result.body.age, 30)
		assert.strictEqual(result.body.active, true)
	})

	it('should find nested commands', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', 'nested', '--attr', 'Child'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.ok(result.body.subCommand instanceof NestedTestMessage)
		assert.strictEqual(result.body.subCommand.name, 'nested')
		assert.strictEqual(result.body.subCommand.body.attr, 'Child')
	})

	it('should throw error for unknown commands', () => {
		const parser = new CommandParser([TestMessage, Main])

		assert.throws(() => {
			parser.parse(['unknown'])
		}, /Unknown root command/)
	})

	it('should correctly convert types', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', '--name', 'Alice', '--age', '28', '--active', 'false'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.strictEqual(typeof result.body.name, 'string')
		assert.strictEqual(typeof result.body.age, 'number')
		assert.strictEqual(typeof result.body.active, 'boolean')

		assert.strictEqual(result.body.name, 'Alice')
		assert.strictEqual(result.body.age, 28)
		assert.strictEqual(result.body.active, false)
	})

	it('should parse command with aliases', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', 'nested', '-a', '--attr', 'Aliased'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.ok(result.body.subCommand instanceof NestedTestMessage)
		assert.strictEqual(result.body.subCommand.name, 'nested')
		assert.strictEqual(result.body.subCommand.body.active, true)
		assert.strictEqual(result.body.subCommand.body.attr, 'Aliased')
	})

	it('should parse only alias without value as boolean', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', 'nested', '-a', '-o'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.ok(result.body.subCommand instanceof NestedTestMessage)
		assert.strictEqual(result.body.subCommand.name, 'nested')
		assert.strictEqual(result.body.subCommand.body.active, true)
		assert.strictEqual(result.body.subCommand.body.online, true)
	})

	it('should parse only alias glued together', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', 'nested', '-ao'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.ok(result.body.subCommand instanceof NestedTestMessage)
		assert.strictEqual(result.body.subCommand.name, 'nested')
		assert.strictEqual(result.body.subCommand.body.active, true)
		assert.strictEqual(result.body.subCommand.body.online, true)
	})

	it('should parse aliases along with full flags', () => {
		const parser = new CommandParser([TestMessage])
		const result = parser.parse(['test', 'nested', '--attr', 'FullFlag', '-o'])

		assert.deepStrictEqual(result.head, { name: 'test' })
		assert.ok(result.body.subCommand instanceof NestedTestMessage)
		assert.strictEqual(result.body.subCommand.name, 'nested')
		assert.strictEqual(result.body.subCommand.body.attr, 'FullFlag')
		assert.strictEqual(result.body.subCommand.body.online, true)
	})

	it('should parse options only properly with only one command and = for option', () => {
		const parser = new CommandParser([Main])
		/** @type {Main} */
		const result = parser.parse('--data=private')
		assert.deepEqual(
			{ ...result.body },
			{
				config: '',
				data: 'private',
				dist: './dist',
				no: false,
				port: 8888,
				public: './public',
				yes: false,
			},
		)
	})

	it('should parse options only properly with only one command with space for option', () => {
		const parser = new CommandParser([Main])
		/** @type {Main} */
		const result = parser.parse('--data private')
		assert.deepEqual(
			{ ...result.body },
			{
				config: '',
				data: 'private',
				dist: './dist',
				no: false,
				port: 8888,
				public: './public',
				yes: false,
			},
		)
	})
})
