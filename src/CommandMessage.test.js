import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandMessage from './CommandMessage.js'
import CommandError from './CommandError.js'

describe('CommandMessage', () => {
	it('should create with defaults', () => {
		const msg = new CommandMessage()
		assert.equal(msg.name, '')
		assert.deepEqual(msg.argv, [])
		assert.deepEqual(msg.opts, {})
		assert.deepEqual(msg.children, [])
	})

	it('should set properties from input', () => {
		const msg = new CommandMessage({
			name: 'test',
			argv: ['arg1'],
			opts: { flag: true },
			children: [new CommandMessage({ name: 'sub' })]
		})
		assert.equal(msg.name, 'test')
		assert.deepEqual(msg.argv, ['arg1'])
		assert.equal(msg.opts.flag, true)
		assert.equal(msg.children[0].name, 'sub')
	})

	it('should compute args correctly', () => {
		const msg = new CommandMessage({ name: 'cmd', argv: ['arg'] })
		assert.deepEqual(msg.args, ['cmd', 'arg'])
	})

	it('should get subCommand and subCommandMessage', () => {
		const sub = new CommandMessage({ name: 'sub' })
		const msg = new CommandMessage({ children: [sub] })
		assert.equal(msg.subCommand, 'sub')
		assert.equal(msg.subCommandMessage, sub)
	})

	it('should add child message', () => {
		const msg = new CommandMessage()
		const child = new CommandMessage({ name: 'child' })
		msg.add(child)
		assert.deepEqual(msg.children, [child])
	})

	it('should parse string input', () => {
		const msg = CommandMessage.parse('test --flag --opt value arg')
		assert.equal(msg.name, 'test')
		assert.deepEqual(msg.argv, ['arg'])
		assert.equal(msg.opts.flag, true)
		assert.equal(msg.opts.opt, 'value')
	})

	it('should parse array input', () => {
		const msg = CommandMessage.parse(['test', '--flag', '--opt', 'value', 'arg'])
		assert.equal(msg.name, 'test')
		assert.deepEqual(msg.argv, ['arg'])
		assert.equal(msg.opts.flag, true)
		assert.equal(msg.opts.opt, 'value')
	})

	it('should throw on empty input', () => {
		assert.throws(() => CommandMessage.parse([]), CommandError)
		assert.throws(() => CommandMessage.parse(''), CommandError)
	})

	it('should toString reconstruct input', () => {
		const msg = CommandMessage.parse(['test', '--flag', '--opt', 'value'])
		assert.equal(msg.toString(), 'test --flag --opt value')
	})

	it('should from create from various inputs', () => {
		const msg1 = CommandMessage.from({ name: 'fromObj' })
		assert.equal(msg1.name, 'fromObj')

		const msg2 = CommandMessage.from(new CommandMessage({ name: 'existing' }))
		assert.equal(msg2.name, 'existing')
	})
})
