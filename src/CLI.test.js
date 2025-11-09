import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { InputMessage, OutputMessage } from '@nan0web/co'

import CLI from './CLI.js'

class EchoCLI extends CLI {
	constructor(input = {}) {
		super(input)
		this.commands.set("echo", this.echo.bind(this))
	}
	async * echo(msg) {
		yield new OutputMessage([`Echo: ${msg.value.body.text}`])
	}
}

// node cli.js echo "John Doe"

describe('CLI', () => {
	it('should initialize with default values', () => {
		const cli = new CLI()
		assert.ok(cli instanceof CLI)
		assert.deepStrictEqual(cli.argv, [])
		assert.ok(cli.commands instanceof Map)
		assert.ok(cli.logger)
	})

	it('should initialize with custom argv', () => {
		const args = ['--verbose', 'command']
		const cli = new CLI({ argv: args })
		assert.deepStrictEqual(cli.argv, args)
	})

	it('should detect logger level from argv', () => {
		const cli = new CLI({ argv: ['--debug'] })
		assert.equal(cli.logger.level, 'debug')
	})

	it('should add help command automatically', () => {
		const cli = new CLI()
		assert.ok(cli.commands.has('help'))
	})

	it('should run help command and yield available commands', async () => {
		const cli = new CLI()
		cli.commands.set('test', async function* () {
			yield new OutputMessage(['Test command output'])
		})

		const msg = new InputMessage({ body: { command: 'help' } })
		const results = []

		for await (const output of cli.run(msg)) {
			results.push(output)
		}

		assert.equal(results.length, 1)
		const content = results[0].content.join('\n')
		assert.ok(content.includes('Available commands'))
		assert.ok(content.includes('help'))
		assert.ok(content.includes('test'))
	})

	it('should run registered command', async () => {
		const cli = new EchoCLI()

		const msg = new InputMessage({ value: { body: { command: 'echo', text: 'hello' } } })
		const results = []

		for await (const output of cli.run(msg)) {
			results.push(output)
		}

		assert.equal(results.length, 1)
		assert.equal(results[0].content[0], 'Echo: hello')
	})

	it('should throw error for unknown command', async () => {
		const cli = new CLI()
		const msg = new InputMessage({ value: { body: { command: 'unknown' } } })

		await assert.rejects(async () => {
			await cli.run(msg).next()
		}, /Command not found: unknown/)
	})

	it('should handle errors from command generators', async () => {
		class ExCLI extends CLI {
			constructor(input) {
				super(input)
				this.commands.set("error", this.error.bind(this))
			}
			async * error(msg) {
				yield new OutputMessage(new Error('Error message'))
			}
		}
		const cli = new ExCLI()

		const msg = new InputMessage({ value: { body: { command: 'error' } } })
		const results = []

		for await (const output of cli.run(msg)) {
			results.push(output)
		}

		assert.equal(results.length, 1)
		assert.ok(results[0].isError)
		assert.ok(results[0].content[0].startsWith('Error: Error message'))
	})

	it('should create CLI instance from object', () => {
		const cli = CLI.from({ argv: ['test'] })
		assert.ok(cli instanceof CLI)
		assert.deepStrictEqual(cli.argv, ['test'])
	})

	it('should return CLI instance if already CLI', () => {
		const originalCli = new CLI()
		const cli = CLI.from(originalCli)
		assert.equal(cli, originalCli)
	})
})
