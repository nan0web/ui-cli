import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Command from './Command.js'
import CommandMessage from './CommandMessage.js'

describe('Command', () => {
	it('should create command with config', () => {
		const command = new Command({
			name: 'test',
			help: 'Test command',
			options: { value: [String, 'default', 'A test value'] }
		})

		assert.equal(command.name, 'test')
		assert.equal(command.help, 'Test command')
		assert.equal(command.options.value[1], 'default')
	})

	it('should parse arguments correctly', () => {
		const command = new Command({
			name: 'test',
			options: { flag: [Boolean, false, 'A flag'] }
		})

		const message = command.parse(['--flag'])
		assert.equal(message.opts.flag, true)
	})

	it('should handle subcommands', () => {
		const subcommand = new Command({
			name: 'sub',
			help: 'Subcommand'
		})

		const command = new Command({
			name: 'test',
			children: [subcommand]
		})

		const message = command.parse(['sub', '--unknown'])
		assert.equal(message.subCommandMessage?.name, 'sub')
	})

	it('should generate proper help text', () => {
		const command = new Command({
			name: 'test',
			help: 'Test command',
			options: { value: [String, 'default', 'A test value'] }
		})

		const help = command.generateHelp()
		assert.ok(help.includes('Usage: test'))
		assert.ok(help.includes('--value'))
		assert.ok(help.includes('Test command'))
	})

	it('should execute command function', async () => {
		const command = new Command({
			name: 'test',
			run: async function* () {
				yield 'result'
			}
		})

		const message = new CommandMessage({ name: 'test' })
		const results = []
		for await (const result of command.execute(message)) {
			results.push(result)
		}

		assert.deepEqual(results, ['result'])
	})
})