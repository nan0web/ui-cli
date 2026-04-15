import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ModelAsApp } from './ModelAsApp.js'
import { InputAdapter } from '@nan0web/ui'

describe('ModelAsApp', () => {
	it('generateHelp() renders correct CLI usage and options', () => {
		class StatusCommand extends ModelAsApp {
			static UI = {
				title: 'show status',
			}
		}
		class PullCommand extends ModelAsApp {
			static UI = {
				title: 'pull changes',
			}
		}

		class TestApp extends ModelAsApp {
			static alias = 'testcli'
			static UI = {
				title: 'Test CLI App',
				description: 'This is a test CLI application.',
				usageTitle: 'Usage:',
				optionsTitle: 'Options:',
			}

			static command = {
				help: 'Command to run (status or pull)',
				options: [StatusCommand, PullCommand],
				positional: true,
				required: true,
			}

			static debug = {
				help: 'Enable debug mode',
				alias: 'd',
				type: 'boolean',
				default: false,
			}

			static verbose = {
				help: 'Enable verbose output',
				type: 'boolean',
				default: false,
			}
		}

		const t = (/** @type {string} */ k, /** @type {any} */ vars) =>
			k.replace('{cmd}', vars?.cmd || '')
		const app = new TestApp({}, { t, plugins: {}, adapter: new InputAdapter() })
		const helpText = app.generateHelp()

		assert.deepStrictEqual(helpText.split('\n'), [
			'Test CLI App',
			'  This is a test CLI application.',
			'',
			'Usage:',
			'  testcli <command> [options]',
			'  testcli status   — show status',
			'  testcli pull     — pull changes',
			'',
			'Options:',
			'      --command   - Command to run (status or pull)',
			'  -d, --debug     - Enable debug mode [false]',
			'      --verbose   - Enable verbose output [false]',
			'      --help      - Show help',
			'',
		])
	})

	it('generateHelp() uses class name when alias is missing', () => {
		class DefaultApp extends ModelAsApp {
			static target = {
				help: 'Target positional',
				positional: true,
			}
		}

		const app = new DefaultApp()
		const helpText = app.generateHelp()

		assert.deepStrictEqual(helpText.split('\n'), [
			'Usage:',
			'  default [target] [options]',
			'',
			'Options:',
			'  --target   - Target positional',
			'  --help     - Show help',
			'',
		])
	})

	it('generateHelp() respects i18n translation function', () => {
		class I18nApp extends ModelAsApp {
			static alias = 'i18ncli'
			static UI = {
				title: 'App title',
				usageTitle: 'Usage:',
			}
			static debug = {
				help: 'Show debug info',
			}
		}

		/**
		 * @param {string} key
		 * @returns {string}
		 */
		const t = (key) => {
			const dict = {
				'App title': 'Заголовок утиліти',
				'Usage:': 'Використання:',
				'Show debug info': 'Увімкнути відлагодження',
			}
			return dict[key] ?? key
		}

		const app = new I18nApp({}, { t, plugins: {}, adapter: new InputAdapter() })
		const helpText = app.generateHelp()

		assert.deepStrictEqual(helpText.split('\n'), [
			'Заголовок утиліти',
			'',
			'Використання:',
			'  i18ncli [options]',
			'',
			'Options:',
			'  --debug   - Увімкнути відлагодження',
			'  --help    - Show help',
			'',
		])
	})

	it('generateHelp() perfectly aligns dual columns for very long options and usage examples', () => {
		class LongApp extends ModelAsApp {
			static alias = 'longcli'
			static UI = {
				usageExamples: [
					'{cmd} run-super-long-subcommand-name-here   — starts the engine',
					'{cmd} start                                 — starts standard',
					'{cmd} short                                 — s',
				],
			}

			static theMostInsanelyLongOptionThatEverExisted = {
				help: 'Wow such a long name',
				type: 'boolean',
				default: true,
			}

			static append = {
				alias: 'a',
				help: 'Short option',
			}
		}

		const t = (/** @type {string} */ k, /** @type {any} */ vars) =>
			k.replace('{cmd}', vars?.cmd || '')
		const app = new LongApp({}, { t, plugins: {}, adapter: new InputAdapter() })
		const helpText = app.generateHelp()

		// Max Left in usageExamples:
		// "  longcli run-super-long-subcommand-name-here" length: 45
		// + 3 chars padding = 48
		// separator: "—"
		// "  longcli run-super-long-subcommand-name-here   — starts the engine"
		// length: 45 + 3 = 48 -> "  longcli run-super-long-subcommand-name-here   "
		// + "— starts the engine"

		// Max Left in Options:
		// "      --theMostInsanelyLongOptionThatEverExisted" length: 48
		// + 4 padding = 52
		// "- Wow such a long name [true]"

		assert.deepStrictEqual(helpText.split('\n'), [
			'Usage:',
			'  longcli [options]',
			'  longcli run-super-long-subcommand-name-here   — starts the engine',
			'  longcli start                                 — starts standard',
			'  longcli short                                 — s',
			'',
			'Options:',
			'      --theMostInsanelyLongOptionThatEverExisted   - Wow such a long name [true]',
			'  -a, --append                                     - Short option',
			'      --help                                       - Show help',
			'',
		])
	})

	it('generateHelp() delegates to active subcommand when nested help is true', () => {
		class SubSubApp extends ModelAsApp {
			static UI = { title: 'SubSub Help' }
			static suboption = { help: 'Deep option' }
		}

		class SubApp extends ModelAsApp {
			static UI = { title: 'Sub Help' }
			static command = { positional: true, type: [SubSubApp] }
			static suboption = { help: 'Sub option' }
		}

		class RootApp extends ModelAsApp {
			static alias = 'root'
			static UI = { title: 'Root Help' }
			static command = { positional: true, type: [SubApp] }
		}

		// Case: app sub --help
		const subSub = new SubSubApp({ help: true })
		const sub = new SubApp({ command: subSub, help: true })
		const root = new RootApp({ command: sub, help: true })

		const helpText = root.generateHelp()
		assert.deepStrictEqual(helpText.split('\n'), [
			'SubSub Help',
			'',
			'Usage:',
			'  root sub subsub [options]',
			'',
			'Options:',
			'  --suboption   - Deep option',
			'  --help        - Show help',
			'',
		])
	})
})
