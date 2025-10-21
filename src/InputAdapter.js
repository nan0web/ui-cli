import { Message } from '@nan0web/co'
import { UIForm, InputAdapter as BaseInputAdapter, InputMessage as BaseInputMessage } from '@nan0web/ui'
import { ask } from './ui/input.js'
import { select } from './ui/select.js'

/** @typedef {Partial<UIForm>} FormMessageValue */
/** @typedef {Partial<Message> | null} InputMessageValue */

/**
 * Extends the generic {@link BaseInputMessage} to carry a {@link UIForm}
 * instance alongside the usual input message payload.
 *
 * The original {@link BaseInputMessage} expects a `value` of type
 * {@link InputMessageValue} (a {@link Message} payload).  To remain
 * compatible we keep `value` unchanged and store the form data in a
 * separate `form` property.
 */
class FormMessage extends BaseInputMessage {
	/** @type {UIForm} Form data associated with the message */
	form

	/**
	 * Creates a new {@link FormMessage}.
	 *
	 * @param {object} props - Message properties.
	 * @param {FormMessageValue} [props.form={}] UIForm instance or data.
	 * @param {InputMessageValue} [props.value=null] Retained for compatibility.
	 * @param {string[]|string} [props.options=[]] Available options.
	 * @param {boolean} [props.waiting=false] Waiting flag.
	 * @param {boolean} [props.escaped=false] Escape flag.
	 */
	constructor(props = {}) {
		const {
			form = {},
			...rest
		} = props
		// Initialise the parent with the remaining properties.
		// Cast to `any` to avoid type‑mismatch between duplicated InputMessage
		// definitions across packages.
		super(/** @type {any} */ (rest))

		// Store the UIForm; accept an object, UIForm or a plain payload.
		this.form = UIForm.from(form)
	}

	/**
	 * Creates a {@link FormMessage} from an existing instance or plain data.
	 *
	 * @param {FormMessage|object} input – Existing message or raw data.
	 * @returns {FormMessage}
	 */
	static from(input) {
		if (input instanceof FormMessage) return input
		const {
			form = {},
			...rest
		} = input ?? {}
		return new FormMessage({ form, ...rest })
	}
}

/**
 * CLI specific adapter extending the generic {@link BaseInputAdapter}.
 * Implements concrete `ask` and `select` helpers that rely on the CLI utilities.
 */
export default class CLIInputAdapter extends BaseInputAdapter {
	/**
	 * Interactively fill a {@link UIForm} field‑by‑field.
	 *
	 * @param {UIForm} form – Form definition to be filled.
	 * @param {Object} options – Request options.
	 * @param {boolean} [options.silent=true] Suppress title output when `true`.
	 * @returns {Promise<FormMessage>} Message with `escaped` = true on cancel,
	 *                                 otherwise `escaped` = false and the completed form attached as `form`.
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

			const input = await this.ask(`${prompt}${field.required ? ' *' : ''}: `)

			// Cancel (Esc or empty string)
			if ([FormMessage.ESCAPE, ''].includes(input)) {
				return FormMessage.from({
					form: {},
					escaped: true,
					action: 'form-cancel',
					id: form.id,
				})
			}

			// Navigation shortcuts
			const trimmed = input.trim()
			if (trimmed === '::prev' || trimmed === '::back') {
				currentFieldIndex = Math.max(0, currentFieldIndex - 1)
				continue
			}
			if (trimmed === '::next' || trimmed === '::skip') {
				currentFieldIndex++
				continue
			}

			// Skip optional fields when empty
			if (trimmed === '' && !field.required) {
				currentFieldIndex++
				continue
			}

			// Validate using the form's schema / field definition
			const schema = field.constructor
			const { isValid, errors } = form.validateValue(field.name, trimmed, schema)
			if (!isValid) {
				const errorMessages = Object.values(errors)
				console.log(`\x1b[31mError: ${errorMessages.join(', ')}\x1b[0m`)
				continue // stay on current field
			}

			// Store validated value
			formData[field.name] = trimmed
			currentFieldIndex++
		}

		// Final form validation
		const finalForm = form.setData(formData)
		const { isValid, errors } = finalForm.validate()
		if (!isValid) {
			console.log('\n' + Object.values(errors).join('\n'))
			return await this.requestForm(form, options) // retry recursively
		}

		return FormMessage.from({
			form: finalForm,
			escaped: false,
			action: 'form-submit',
			id: form.id,
		})
	}

	/**
	 * Request a selection from a list of options.
	 *
	 * @param {Object} config – Selection configuration.
	 * @param {string} config.title – Title displayed before the list.
	 * @param {string} config.prompt – Prompt text.
	 * @param {Array<string>|Map<string,string>|Array<{label:string,value:string}>} config.options – Options to choose from.
	 * @param {string} config.id – Identifier for the resulting message.
	 * @returns {Promise<BaseInputMessage>} Message containing chosen value and metadata.
	 */
	async requestSelect(config) {
		try {
			const result = await this.select({
				title: config.title ?? 'Select an option:',
				prompt: config.prompt ?? 'Choose (1‑N): ',
				options: config.options,
				console: console,
			})
			return BaseInputMessage.from({
				value: result.value,
				data: result,
				id: config.id,
			})
		} catch (error) {
			if (error instanceof this.CancelError) {
				return BaseInputMessage.from({
					value: '',
					id: config.id,
				})
			}
			throw error
		}
	}

	/**
	 * Simple string input request.
	 *
	 * @param {Object} config Input configuration.
	 * @param {string} config.prompt Prompt text.
	 * @param {string} config.id Identifier for the resulting message.
	 * @param {string} [config.label] Optional label used as fallback.
	 * @param {string} [config.name] Optional name used as fallback.
	 * @returns {Promise<BaseInputMessage>} Message containing the entered text.
	 */
	async requestInput(config) {
		const prompt = config.prompt ?? `${config.label ?? config.name}: `
		const input = await this.ask(prompt)

		if (input === '') {
			return BaseInputMessage.from({
				value: '',
				id: config.id,
			})
		}

		return BaseInputMessage.from({
			value: input,
			id: config.id,
		})
	}

	/** @inheritDoc */
	async ask(question) {
		return ask(question)
	}

	/** @inheritDoc */
	async select(config) {
		return select(config)
	}
}
