import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { Message } from '@nan0web/co'
import CommandHelp from './CommandHelp.js'
import { Logger } from '@nan0web/log'
import { NoConsole } from '@nan0web/log'

/** @typedef {import("@nan0web/co").ValidateFn} ValidateFn */
/** @typedef {import("@nan0web/co").MessageInput} MessageInput */

class Body {}

// Mock Message class for testing
class AuthMessage extends Message {
	static name = 'auth'
	static help = 'Authentication command'

	static Body = class LogInBody extends Body {
		static username = {
			help: 'Username for login',
			placeholder: '<user>',
			alias: 'u',
			/** @type {ValidateFn} */
			validate: (value) => {
				if (value.length > 3) return true
				return 'Username must be at least 3 characters'
			},
		}
		username = ''

		static password = {
			alias: 'p',
			placeholder: '<password>',
			/** @type {ValidateFn} */
			validate: (value) => {
				if (value.length > 0) return true
				return 'Password is required'
			},
		}
		password = ''

		static remember_me = {
			help: 'Remember my session for 1 year',
			defaultValue: false,
		}
		remember_me = false

		/** @todo add jsdoc through AuthMessageInput typedef */
		constructor(input = {}) {
			super()
			const { username = this.username, password = this.password } = input
			this.username = String(username)
			this.password = String(password)
		}
	}
	/** @type {LogInBody} */
	body

	/** @param {MessageInput} input */
	constructor(input = {}) {
		super(input)
		this.body = new AuthMessage.Body(input.body ?? {})
	}
}

// Message with no body fields
class EmptyMessage extends Message {
	static name = 'empty'
	static help = 'Empty command'
	static Body = class EmptyBody extends Body {}
}

// Message with subcommands
class ChildMessage extends Message {
	static name = 'child'
	static help = 'Child command'
}

class ParentMessage extends Message {
	static name = 'parent'
	static help = 'Parent command'
	static Children = [ChildMessage]

	static Body = class EmptyBody extends Body {}
}

class MainBody {
	static config = {
		help: 'Path to config file (optional)',
		defaultValue: '',
	}
	config = ''

	static data = {
		help: 'Data directory path or connection string (DSN)',
		defaultValue: './data',
	}
	data = './data'

	static public = {
		help: 'Public assets directory',
		defaultValue: './public',
	}
	public = './public'

	static dist = {
		help: 'Output directory for SSG',
		defaultValue: './public',
	}
	dist = './dist'

	static port = {
		help: 'API server port',
		defaultValue: 8888,
	}
	port = 8888

	static yes = {
		help: 'Non-interactive mode (yes to all prompts)',
		defaultValue: false,
	}
	yes = false

	static no = {
		help: 'Non-interactive mode (no to all prompts)',
		defaultValue: false,
	}
	no = false

	static help = {
		help: 'Show help',
		defaultValue: false,
	}
	help = false
}

/**
 * @extends Message
 */
class Main extends Message {
	static name = 'nan0web'
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

/* -------------------------------------------------------------------------- */

class TTYLogger extends Logger {
	static get isTTY() {
		return true
	}
	get isTTY() {
		return true
	}
	/**
	 * Patched static style to use 'this' instead of 'Logger'
	 * for correct RESET/Color references in subclasses.
	 */
	static style(value, styleOptions = {}) {
		const { bgColor = '', color = '', stripped = false } = styleOptions
		if (stripped) return String(value)
		const rows = String(value).split('\n')
		const styledValue = []

		rows.forEach((row) => {
			if (this.isTTY) {
				if (color) styledValue.push(this[color.toUpperCase()] || color)
				if (bgColor) styledValue.push(this[`BG_${bgColor.toUpperCase()}`] || bgColor)
			}
			styledValue.push(row)
			if (this.isTTY) {
				styledValue.push(this.RESET)
			}
			styledValue.push('\n')
		})
		return styledValue.join('').slice(0, -1)
	}
}
const logger = new TTYLogger()

describe('CommandHelp', () => {
	it('should create CommandHelp instance with correct properties', () => {
		const help = new CommandHelp(AuthMessage, logger)
		assert.equal(help.MessageClass.name, 'auth')
		assert.equal(help.MessageClass.help, 'Authentication command')
		assert.equal(help.BodyClass, AuthMessage.Body)
	})

	it('should generate help text correctly', () => {
		const help = new CommandHelp(AuthMessage, logger)

		const generated = help.generate()
		assert.equal(
			generated,
			[
				'\x1B[35mauth\x1B[0m • Authentication command',
				'',
				'Usage: auth [-u, --username=<user>] [-p, --password=<password>], [--remember_me]',
				'',
				'Options:',
				'  --username, -u                 string    * Username for login',
				'  --password, -p                 string    * No description',
				'  --remember_me                  boolean     Remember my session for 1 year',
				'',
			].join('\n')
		)
	})

	it('should generate usage without body fields', () => {
		const help = new CommandHelp(EmptyMessage, logger)
		const generated = help.generate()
		assert.equal(
			generated,
			['\x1B[35mempty\x1B[0m • Empty command', '', 'Usage: empty', ''].join('\n')
		)
	})

	it('should list subcommands when present', () => {
		const help = new CommandHelp(ParentMessage, logger)
		const generated = help.generate()
		assert.equal(
			generated,
			[
				'\x1B[35mparent\x1B[0m • Parent command',
				'',
				'Usage: parent',
				'',
				'Subcommands:',
				'  child                 Child command',
				'',
			].join('\n')
		)
	})

	it('should prints the correct help', () => {
		const logger = new TTYLogger({ console: new NoConsole() })
		const help = new CommandHelp(Main, logger)
		help.print()
		// the weird console.console must be fixed in next major release.
		assert.deepStrictEqual(help.logger.console.console.output(), [
			[
				'info',
				[
					'\x1B[35mnan0web\x1B[0m',
					'',
					'Usage: nan0web [--data=./data] [--public=./public] [--dist=./public] [--port=8888] [--config] [--yes] [--no] [--help]',
					'',
					'Options:',
					'  --config                       string      Path to config file (optional)',
					'  --data                         string      Data directory path or connection string (DSN)',
					'  --public                       string      Public assets directory',
					'  --dist                         string      Output directory for SSG',
					'  --port                         number      API server port',
					'  --yes                          boolean     Non-interactive mode (yes to all prompts)',
					'  --no                           boolean     Non-interactive mode (no to all prompts)',
					'  --help                         boolean     Show help',
					'',
				].join('\n'),
			],
		])
	})

	it('should validate AuthMessage.Body fields correctly (valid data)', () => {
		const msg = new AuthMessage({ body: { username: 'tester', password: 'secret' } })
		const result = msg.validate()
		assert.equal(result.size, 0, 'body should be valid')
	})

	it('should validate AuthMessage.Body fields correctly (invalid username)', () => {
		const msg = new AuthMessage({ body: { username: 'ab', password: 'pwd' } })
		const result = msg.validate()
		assert.equal(
			result.get('username'),
			'Username must be at least 3 characters',
			'username should be invalid (too short)'
		)
		assert.equal(result.get('password'), undefined, 'password should be valid')
	})

	it('should return an empty validation map for bodies without validators', () => {
		const msg = new EmptyMessage()
		const result = msg.validate()
		assert.equal(result.size, 0, 'validation map should be empty')
	})
})
