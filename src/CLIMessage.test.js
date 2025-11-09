import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CLIMessage from './CLIMessage.js'

describe('CLIMessage', () => {
	it('should parse command with options and subcommands', () => {
		const schemas = [{
			name: 'test',
			help: 'Test command',
			Schema: class {
				static value = "default"
				static valueHelp = "A test value"
			},
			Children: [{
				name: 'sub',
				help: 'Subcommand'
			}]
		}]

		const cli = new CLIMessage(schemas)
		const result = cli.parse(['test', '--value', 'custom', 'sub'])

		assert.equal(result.name, 'sub')
		assert.equal(result.body.value, 'custom')
		assert.equal(result.subCommand, '')
	})

	it('should handle boolean options correctly', () => {
		const schemas = [{
			name: 'test',
			Schema: class {
				static flag = false
			}
		}]

		const cli = new CLIMessage(schemas)
		const result = cli.parse(['test', '--flag'])

		assert.equal(result.body.flag, true)
	})

	it('should apply defaults when options are not provided', () => {
		const schemas = [{
			name: 'test',
			Schema: class {
				static count = 5
			}
		}]

		const cli = new CLIMessage(schemas)
		const result = cli.parse(['test'])

		assert.equal(result.body.count, 5)
	})
})