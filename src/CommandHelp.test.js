import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandHelp from './CommandHelp.js'
import { NoLogger } from '@nan0web/log'

// Mock Body class for testing
class LogInBody {
	username = ""
	password = ""

	constructor() {
		this.username = ""
		this.password = ""
	}

	static username = {
		help: "Username for login",
		placeholder: "<user>",
		alias: "u"
	}

	static password = {
		validation: (value) => value.length > 0,
		alias: "p"
	}
}

describe('CommandHelp', () => {
	it('should create CommandHelp instance with correct properties', () => {
		const help = new CommandHelp({
			name: 'auth',
			help: 'Authentication commands',
			Body: LogInBody,
			logger: new NoLogger()
		})

		assert.equal(help.name, 'auth')
		assert.equal(help.help, 'Authentication commands')
		assert.equal(help.Body, LogInBody)
		assert.ok(help.logger instanceof NoLogger)
	})

	it('should use default logger when not provided', () => {
		const help = new CommandHelp({
			name: 'auth',
			help: 'Authentication commands',
			Body: LogInBody
		})

		assert.ok(help.logger)
	})

	it('should generate help text correctly', () => {
		const logger = new NoLogger()
		const help = new CommandHelp({
			name: 'auth',
			help: 'Authentication commands',
			Body: LogInBody,
			logger
		})

		help.print()

		// Check that logs were generated
		const logs = logger.output()
		assert.ok(logs.length > 0)

		// Check header
		const headerLog = logs[0]
		assert.equal(headerLog[0], 'info')
		assert.ok(headerLog[1].includes('- Authentication commands'))
		assert.ok(headerLog[1].includes('auth'))

		// Check usage line
		const usageLog = logs[1]
		assert.equal(usageLog[0], 'info')
		assert.ok(usageLog[1].includes('Usage: auth -u, --username=<user> -p, --password=<password>'))

		// Check options section header
		const optionsHeaderLog = logs[2]
		assert.equal(optionsHeaderLog[0], 'info')
		assert.equal(optionsHeaderLog[1], 'Options:')

		// Check option lines
		const usernameOptionLog = logs[3]
		const passwordOptionLog = logs[4]

		assert.ok(usernameOptionLog[1].includes('--username, -u'))
		assert.ok(usernameOptionLog[1].includes('string'))
		assert.ok(usernameOptionLog[1].includes('Username for login'))

		assert.ok(passwordOptionLog[1].includes('--password, -p'))
		assert.ok(passwordOptionLog[1].includes('string'))
		assert.ok(passwordOptionLog[1].includes('Field with validation rules'))
	})
})
