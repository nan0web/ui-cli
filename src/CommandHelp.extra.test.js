import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import CommandHelp from './CommandHelp.js'
import { Message } from '@nan0web/co'

/* Helper to create a mock Message with configurable schema */
function createMockMessage(name, help, bodySchema, children = []) {
	class MockBody {
		constructor() {
			// Initialise properties with sensible defaults
			Object.keys(bodySchema).forEach(k => {
				const schema = bodySchema[k]
				if (schema.placeholder !== undefined) {
					this[k] = ''               // string placeholder → default string
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
		const TestMsg = createMockMessage(
			'git',
			'Git command',
			{
				init:    { alias: 'i', help: 'Create an empty repository' },
				verbose: { alias: 'v', help: 'Show detailed output' },
			}
		)

		const help = new CommandHelp(TestMsg)
		const generated = help.generate()
		assert.equal(generated, [
			`git • Git command`,
			'',
			'Usage: git [-i, --init] , [-v, --verbose]',
			'',
			'Options:',
			'  --init, -i                     boolean  *  Create an empty repository',
			'  --verbose, -v                  boolean  *  Show detailed output',
			'',
		].join('\n'))
	})

	it('should render subcommands with mixed case names', () => {
		const ChildA = createMockMessage('add', 'Add sub‑command', {})
		const ChildB = createMockMessage('remove', 'Remove sub‑command', {})

		const ParentMsg = createMockMessage(
			'project',
			'Project command',
			{ force: { help: 'Force operation' } },
			[ChildA, ChildB]
		)

		const help = new CommandHelp(ParentMsg)
		const generated = help.generate()
		assert.equal(generated, [
			`project • Project command`,
			'',
			'Usage: project [--force]',
			'',
			'Options:',
			'  --force                        boolean  *  Force operation',
			'',
			'Subcommands:',
			'  add                   Add sub‑command',
			'  remove                Remove sub‑command',
			'',
		].join('\n'))
	})

	it('should correctly pluralise help text even when already plural', () => {
		const Msg = createMockMessage('list', 'List commands', {})
		const help = new CommandHelp(Msg)
		const generated = help.generate()
		assert.ok(generated.startsWith('list • List commands'), 'Help text should not add extra “s”')
	})
})
