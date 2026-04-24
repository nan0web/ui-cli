import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ModelAsApp } from './ModelAsApp.js'

class SubCommand extends ModelAsApp {
	static alias = 'sub'
	async *run() {
		yield { type: 'log', message: 'Sub running' }
	}
}

class RootApp extends ModelAsApp {
	static command = {
		options: [SubCommand],
		positional: true
	}
}

describe('ModelAsApp Automated Subcommands', () => {
	it('should instantiate subcommand from string alias in constructor', () => {
		const app = new RootApp({ command: 'sub' })
		assert.ok(app.command instanceof SubCommand, 'command should be an instance of SubCommand')
	})

	it('should instantiate subcommand from class in constructor', () => {
		const app = new RootApp({ command: SubCommand })
		assert.ok(app.command instanceof SubCommand, 'command should be an instance of SubCommand')
	})

	it('should delegate help recursively to instantiated subcommand', () => {
		const app = new RootApp({ command: 'sub', help: true })
		assert.ok(app.command.help, 'Subcommand instance should have help: true')
		
		const helpText = app.generateHelp()
		assert.ok(helpText.includes('Usage:'), 'Should render help')
		assert.ok(helpText.includes('root sub'), 'Should include subcommand path')
	})
})
