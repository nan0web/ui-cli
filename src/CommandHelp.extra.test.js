import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandHelp from './CommandHelp.js'
import { Message } from '@nan0web/co'

import { Logger } from '@nan0web/log'

class TTYLogger extends Logger {
	static get isTTY() {
		return true
	}
	get isTTY() {
		return true
	}
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

/* Helper to create a mock Message with configurable schema */
function createMockMessage(name, help, bodySchema, children = []) {
	class MockBody {
		constructor() {
			// Initialise properties with sensible defaults
			Object.keys(bodySchema).forEach((k) => {
				const schema = bodySchema[k]
				if (schema.placeholder !== undefined) {
					this[k] = '' // string placeholder → default string
				} else {
					// Boolean flag – default false
					this[k] = false
				}
			})
		}
	}
	// Attach static descriptors (used by CommandHelp)
	Object.entries(bodySchema).forEach(([k, v]) => {
		MockBody[k] = v
	})

	class MockMessage extends Message {
		static name = name
		static help = help
		static Body = MockBody
		static Children = children
	}
	return MockMessage
}

/* -------------------------------------------------------------------------- */

describe('CommandHelp – extended scenarios', () => {
	it('should render help for a command with alias‑only boolean flag', () => {
		const TestMsg = createMockMessage('git', 'Git command', {
			init: { alias: 'i', help: 'Create an empty repository', defaultValue: false },
			verbose: { alias: 'v', help: 'Show detailed output', defaultValue: false },
		})

		const help = new CommandHelp(TestMsg, logger)
		const generated = help.generate()
		assert.equal(
			generated,
			[
				`\x1B[35mgit\x1B[0m • Git command`,
				'',
				'Usage: git [-i, --init] , [-v, --verbose]',
				'',
				'Options:',
				'  --init, -i                     boolean     Create an empty repository',
				'  --verbose, -v                  boolean     Show detailed output',
				'',
			].join('\n')
		)
	})

	it('should render subcommands with mixed case names', () => {
		const ChildA = createMockMessage('add', 'Add sub‑command', {})
		const ChildB = createMockMessage('remove', 'Remove sub‑command', {})

		const ParentMsg = createMockMessage(
			'project',
			'Project command',
			{ force: { help: 'Force operation', defaultValue: false } },
			[ChildA, ChildB]
		)

		const help = new CommandHelp(ParentMsg, logger)
		const generated = help.generate()
		assert.equal(
			generated,
			[
				`\x1B[35mproject\x1B[0m • Project command`,
				'',
				'Usage: project [--force]',
				'',
				'Options:',
				'  --force                        boolean     Force operation',
				'',
				'Subcommands:',
				'  add                   Add sub‑command',
				'  remove                Remove sub‑command',
				'',
			].join('\n')
		)
	})

	it('should correctly pluralise help text even when already plural', () => {
		const Msg = createMockMessage('list', 'List commands', {})
		const help = new CommandHelp(Msg, logger)
		const generated = help.generate()
		assert.ok(
			generated.startsWith('\x1b[35mlist\x1b[0m • List commands'),
			'Help text should not add extra “s”'
		)
	})
})
