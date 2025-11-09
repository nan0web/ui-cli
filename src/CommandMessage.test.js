import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandMessage, {
	argStringToArray,
	handleLongOption,
	handleShortOption,
	updateIndexAfterOption,
	formatOptions
} from './CommandMessage.js'

describe('CommandMessage', () => {
	it('should parse string arguments correctly', () => {
		const message = CommandMessage.parse('--flag --option value arg1 arg2')
		assert.equal(message.name, 'arg1')
		assert.equal(message.opts.flag, true)
		assert.equal(message.opts.option, 'value')
		assert.deepEqual(message.argv, ['arg2'])
	})

	it('should parse array arguments correctly', () => {
		const message = CommandMessage.parse(['--flag', '--option', 'value', 'arg1'])
		assert.equal(message.opts.flag, true)
		assert.equal(message.opts.option, 'value')
		assert.deepEqual(message.argv, [])
	})

	it('should handle quoted arguments', () => {
		const args = argStringToArray('"hello world" --test="quoted value"')
		assert.deepEqual(args, ['hello world', '--test=quoted value'])
	})

	it('should convert to string correctly', () => {
		const message = new CommandMessage({
			name: 'test',
			argv: ['arg1', 'arg with spaces'],
			opts: { flag: true, option: 'value' }
		})

		const str = message.toString()
		assert.ok(str.includes('test'))
		assert.ok(str.includes('arg1'))
		assert.ok(str.includes('"arg with spaces"'))
		assert.ok(str.includes('--flag'))
		assert.ok(str.includes('--option value'))
	})

	it('should handle long options with equals', () => {
		const msg = new CommandMessage()
		handleLongOption(msg, ['--test=value'], 0)
		assert.equal(msg.opts.test, 'value')
	})

	it('should handle long options with separate value', () => {
		const msg = new CommandMessage()
		handleLongOption(msg, ['--test', 'value'], 0)
		assert.equal(msg.opts.test, 'value')
	})

	it('should handle boolean long options', () => {
		const msg = new CommandMessage()
		handleLongOption(msg, ['--flag'], 0)
		assert.equal(msg.opts.flag, true)
	})

	it('should handle short options', () => {
		const msg = new CommandMessage()
		handleShortOption(msg, ['-t', 'value'], 0)
		assert.equal(msg.opts.t, 'value')
	})

	it('should handle combined short options', () => {
		const msg = new CommandMessage()
		handleShortOption(msg, ['-abc'], 0)
		assert.equal(msg.opts.a, true)
		assert.equal(msg.opts.b, true)
		assert.equal(msg.opts.c, true)
	})

	it('should update index correctly for option with value', () => {
		let index = updateIndexAfterOption(['--test', 'value'], 0)
		assert.equal(index, 2)

		index = updateIndexAfterOption(['--test=value'], 0)
		assert.equal(index, 1)

		index = updateIndexAfterOption(['--flag'], 0)
		assert.equal(index, 1)
	})

	it('should format options correctly', () => {
		const opts = { flag: true, option: 'value', quoted: 'hello world' }
		const formatted = formatOptions(opts)
		
		assert.ok(formatted.includes('--flag'))
		assert.ok(formatted.includes('--option value'))
		assert.ok(formatted.includes('--quoted="hello world"'))
	})
})