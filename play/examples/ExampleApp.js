/**
 * ExampleApp — OLMUI Reference App for @nan0web/ui-cli.
 *
 * Demonstrates the "App as a Model" pattern:
 *   - `run()` generator yields intents (ask/progress/log/result)
 *   - No routing, no boilerplate — just a Model that drives the UI.
 *
 * Launch:  node bin/nan0cli.js   (reads exports['./ui/cli'] from package.json)
 */
import { ask, progress, log, result } from '../../../ui/src/core/Intent.js'

export default class ExampleApp {

	// ─── UI Metadata (i18n keys, Zero Hardcode) ───

	static UI = {
		title: 'UI-CLI Example App',
		description: 'Interactive showcase of all OLMUI intent types',
	}

	static lang = {
		help: 'Choose language / Виберіть мову',
		default: 'uk',
		options: [
			{ value: 'uk', label: 'Укр (Ukrainian)' },
			{ value: 'en', label: 'Eng (English)' },
		]
	}

	static action = {
		help: 'Choose an action',
		default: '',
		options: [
			{ value: 'greet',    label: '👋 Greeting Demo' },
			{ value: 'survey',   label: '📋 Mini Survey' },
			{ value: 'progress', label: '⏳ Progress Demo' },
			{ value: 'sandbox',  label: '🧱 Component Sandbox' },
			{ value: 'lang',     label: '🌍 Change Language' },
			{ value: 'quit',     label: '🚪 Exit' },
		],
	}

	static name_field = {
		help: 'What is your name?',
		default: 'World',
	}

	static age = {
		help: 'How old are you?',
		default: 25,
		type: 'number',
		hint: 'slider',
		min: 1,
		max: 120,
	}

	static color = {
		help: 'Favourite colour',
		default: '',
		options: [
			{ value: 'red',    label: '🔴 Red' },
			{ value: 'green',  label: '🟢 Green' },
			{ value: 'blue',   label: '🔵 Blue' },
			{ value: 'purple', label: '🟣 Purple' },
		],
	}

	static confirm_exit = {
		help: 'Really exit?',
		default: false,
		hint: 'confirm',
	}

	async *run() {
		yield log('info', ExampleApp.UI.title)
		yield log('info', '─'.repeat(40))

		while (true) {
			const actionRes = yield ask('action', ExampleApp.action)
			const action = actionRes?.value

			switch (action) {
				case 'greet':
					yield* this.#greetFlow()
					break

				case 'survey':
					yield* this.#surveyFlow()
					break

				case 'progress':
					yield* this.#progressFlow()
					break

				case 'sandbox': {
					const { default: SandboxApp } = await import('./SandboxApp.js')
					const sandbox = new SandboxApp()
					yield* sandbox.run()
					break
				}

				case 'lang': {
					const langRes = yield ask('lang', ExampleApp.lang)
					if (langRes && langRes.value) {
						return result({ action: 'set_locale', locale: langRes.value })
					}
					break
				}

				case 'quit': {
					const yesRes = yield ask('confirm_exit', ExampleApp.confirm_exit)
					const yes = yesRes?.value ?? yesRes
					if (yes) return
					break
				}
			}
		}
	}

	// ─── Sub-flows ───

	async *#greetFlow() {
		const nameRes = yield ask('name_field', ExampleApp.name_field)
		const name = nameRes?.value
		yield log('success', `Hello, ${name}! 🎉`)
	}

	async *#surveyFlow() {
		const nameRes = yield ask('name_field', ExampleApp.name_field)
		const name = nameRes?.value
		
		const ageRes = yield ask('age', ExampleApp.age)
		const age = ageRes?.value
		
		const colorRes = yield ask('color', ExampleApp.color)
		const color = colorRes?.value

		yield result({
			name,
			age,
			color,
			summary: `${name}, ${age}y.o., loves ${color}`,
		})
	}

	async *#progressFlow() {
		yield progress('Processing step 1...')
		yield log('info', 'Step 1 complete')

		yield progress('Processing step 2...')
		yield log('info', 'Step 2 complete')

		yield progress('Finalising...')
		yield log('success', 'All steps finished! ✅')
	}
}
