/**
 * Form demo – demonstrates the new Form class with a User model.
 *
 * @module play/form-demo
 */

import Logger from '@nan0web/log'
import Form from '../src/ui/form.js'

/**
 * Simple User model with static schema for Form.
 */
class User {
	username
	age
	color

	static username = {
		help: 'Unique user name',
		defaultValue: '',
		validate: (input) => (/^\w+$/.test(input) ? true : 'Invalid username (alphanumeric only)'),
	}

	static age = {
		help: 'User age',
		type: 'number',
		required: true,
		defaultValue: 18,
		validate: (input) => {
			const num = Number(input)
			return num >= 18 ? true : 'Age must be 18 or older'
		},
	}

	static color = {
		help: 'Favorite color',
		options: ['Red', 'Green', 'Blue'],
		defaultValue: 'Red',
		validate: (input) => (['Red', 'Green', 'Blue'].includes(input) ? true : 'Invalid color'),
	}

	constructor(input = {}) {
		const {
			username = this.constructor.username.defaultValue,
			age = this.constructor.age.defaultValue,
			color = this.constructor.color.defaultValue,
		} = input
		this.username = String(username)
		this.age = Number(age)
		this.color = String(color)
	}
}

/**
 * Run the form demo using CLIInputAdapter for input.
 *
 * @param {Logger} console - Logger instance.
 * @param {import("../src/InputAdapter.js").default} adapter - Input adapter for prompts.
 * @param {Function} t - Translation function.
 */
export async function runFormDemo(console, adapter, t) {
	console.clear()
	console.success(t('Form Demo – Using Custom Form Class'))

	/**
	 * Simple User model with static schema for Form.
	 * Metadata uses translation keys as strings.
	 */
	class User {
		username
		age
		color

		static username = {
			help: 'Unique user name',
			defaultValue: '',
			validate: (input) => (input.trim().length > 0 ? true : 'Username is required (supports Latin, Cyrillic, etc.)'),
		}

		static age = {
			help: 'User age',
			type: 'number',
			required: true,
			defaultValue: 18,
			validate: (input) => {
				const num = Number(input)
				return num >= 18 ? true : 'Age must be 18 or older'
			},
		}

		static color = {
			help: 'Favorite color',
			options: [
				{ label: 'Red', value: 'Red' },
				{ label: 'Green', value: 'Green' },
				{ label: 'Blue', value: 'Blue' }
			],
			defaultValue: 'Red',
			validate: (input) => (['Red', 'Green', 'Blue'].includes(input) ? true : 'Invalid color'),
			// Helper to translate options dynamically
			getTranslatedOptions: (t) => [
				{ label: t('Red'), value: 'Red' },
				{ label: t('Green'), value: 'Green' },
				{ label: t('Blue'), value: 'Blue' }
			]
		}

		constructor(input = {}) {
			const {
				username = User.username.defaultValue,
				age = User.age.defaultValue,
				color = User.color.defaultValue,
			} = input
			this.username = String(username)
			this.age = Number(age)
			this.color = String(color)
		}
	}

	// Create initial user from env or defaults
	const initialUsername = process.env.USER_USERNAME || ''
	const user = new User({ username: initialUsername })

	// Create handlers with stops, bound to adapter for predefined
	const handler = adapter.createHandler(['quit', 'cancel', 'exit'])
	const selectHandler = adapter.createSelectHandler()

	// Use our Form class
	const form = new Form(user, { inputFn: handler, selectFn: selectHandler, t })

	console.info(t('Filling user form... (uses predefined sequence if set)'))

	try {
		const result = await form.requireInput()
		if (result.cancelled) {
			console.info(t('Selection cancelled. Returning to menu...'))
			return
		}

		console.success(t('Form completed successfully!'))
		console.info(`${t('User:')} ${form.body.username}, ${t('Age:')} ${form.body.age}, ${t('Color:')} ${t(form.body.color)}`)
	} catch (error) {
		console.error(`${t('Form error:')} ${error.message}`)
	}
}
