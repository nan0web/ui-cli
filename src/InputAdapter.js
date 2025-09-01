import { InputMessage, InputAdapter, UIForm } from '@nan0web/ui'
import { ask } from './ui/input.js'
import { select } from './ui/select.js'
import { CancelError } from './ui/errors.js'

export default class CLIInputAdapter extends InputAdapter {
	/**
	 * Requests data using step-by-step input
	 * @param {UIForm} form - Form to fill
	 * @param {Object} options - Request options
	 * @param {boolean} [options.silent=true] - Whether to suppress title output
	 * @returns {Promise<UIForm | InputMessage>} UIForm (new form) with the fulfilled state or InputMessage on cancel.
	 */
	async requestForm(form, options = {}) {
		const { silent = true } = options

		if (!silent) {
			console.log(`\n${form.title}\n`)
		}

		let formData = { ...form.state }
		let currentFieldIndex = 0

		while (currentFieldIndex < form.fields.length) {
			const field = form.fields[currentFieldIndex]
			const prompt = field.label || field.name

			const input = await ask(`${prompt}${field.required ? ' *' : ''}: `)

			// Check for empty input (Ctrl+C may be handled as empty string)
			if (input === '') {
				return InputMessage.from({
					value: '',
					escaped: true,
					action: 'form-cancel',
					id: form.id,
				})
			}

			// Navigation commands
			const trimmed = input.trim()
			if (trimmed === '::prev' || trimmed === '::back') {
				currentFieldIndex = Math.max(0, currentFieldIndex - 1)
				continue
			}

			if (trimmed === '::next' || trimmed === '::skip') {
				currentFieldIndex++
				continue
			}

			// Skip optional fields
			if (trimmed === '' && !field.required) {
				currentFieldIndex++
				continue
			}

			// Validation
			const schema = field.constructor
			const { isValid, errors } = form.validateValue(field.name, trimmed, schema)
			if (!isValid) {
				const errorMessages = Object.values(errors)
				console.log(`\x1b[31mError: ${errorMessages.join(', ')}\x1b[0m`)
				continue // stay on current field
			}

			// Save value
			formData[field.name] = trimmed
			currentFieldIndex++
		}

		// Final form validation
		const finalForm = form.setData(formData)
		const { isValid, errors } = finalForm.validate()

		if (!isValid) {
			console.log('\n' + Object.values(errors).join('\n'))
			return this.requestForm(form, options) // recursive retry
		}

		return UIForm.from({ ...form, state: formData })
	}

	/**
	 * Request selection from a list
	 * @param {Object} config - Selection configuration
	 * @param {string} config.title - Selection title
	 * @param {string} config.prompt - Selection prompt
	 * @param {Array<string> | Map<string, string> | Array<{ label: string, value: string }>} config.options - Selection options
	 * @param {string} config.id - Element identifier
	 * @returns {Promise<InputMessage>} Input message with result
	 */
	async requestSelect(config) {
		try {
			const result = await select({
				title: config.title || 'Select an option:',
				prompt: config.prompt || 'Choose (1-N): ',
				options: config.options,
				console: console,
			})
			return InputMessage.from({
				value: result.value,
				data: result,
			})
		} catch (error) {
			if (error instanceof CancelError) {
				return InputMessage.from({
					value: '',
					id: config.id,
				})
			}
			throw error
		}
	}

	/**
	 * Simple string input request
	 * @param {Object} config - Input configuration
	 * @param {string} config.prompt - Input prompt
	 * @param {string} config.id - Element identifier
	 * @param {string} config.label
	 * @param {string} config.name
	 * @returns {Promise<InputMessage>} Input message with result
	 */
	async requestInput(config) {
		const prompt = config.prompt || `${config.label || config.name}: `
		const input = await ask(prompt)

		if (input === '') {
			return InputMessage.from({
				value: '',
				id: config.id,
			})
		}

		return InputMessage.from({
			value: input,
			id: config.id,
		})
	}
}
