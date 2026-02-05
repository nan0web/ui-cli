import { describe, it, mock, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import Form from './form.js'
import { createPredefinedInput } from './input.js'
import * as selectModule from './select.js'
import { CancelError } from '@nan0web/ui/core'

const mockConsole = { info: () => {}, error: () => {} }
const defaultStops = ['quit', 'cancel', 'exit']

class User {
	static username = {
		help: 'Unique user name',
		defaultValue: '',
		validate: (input) => (/^\w+$/.test(input) ? true : 'Invalid username'),
	}
	static age = {
		help: 'User age',
		type: 'number',
		required: true,
		defaultValue: 18,
		validate: (input) => {
			const num = Number(input)
			return num >= 18 ? true : 'Too young'
		},
	}
	static color = {
		help: 'Pick a color',
		options: ['Red', 'Green', 'Blue'],
		defaultValue: '',
		validate: (input) => (['Red', 'Green', 'Blue'].includes(input) ? true : 'Invalid color'),
	}
	constructor(input = {}) {
		const { username = '', age = 18 } = input
		this.username = String(username)
		this.age = Number(age)
		this.color = ''
	}
}

describe('Form class', () => {
	describe('constructor', () => {
		it('should create with a valid model instance', () => {
			const user = new User()
			const form = new Form(user)
			assert.ok(form instanceof Form)
		})

		it('should throw TypeError for invalid model', () => {
			assert.throws(() => new Form(null), TypeError)
			assert.throws(() => new Form('string'), TypeError)
			assert.throws(() => new Form({ constructor: null }), TypeError)
		})
	})

	describe('#generateFields (private, tested indirectly)', () => {
		it('should generate fields from static schema', async () => {
			const user = new User()
			const form = new Form(user)
			form.handler = createPredefinedInput(['validuser', '30'], mockConsole, defaultStops)
			form.select = async (config) => ({ index: 1, value: 'Green' })
			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(form.body.username, 'validuser')
			assert.strictEqual(form.body.age, 30)
			assert.strictEqual(form.body.color, 'Green')
		})

		it('should skip non-object static properties', async () => {
			class BadSchema {
				static valid = { help: 'ok' }
				static invalid = null
				static stringProp = 'ignore'
			}
			const model = new BadSchema()
			const form = new Form(model)
			form.handler = createPredefinedInput(['okvalue'], mockConsole, defaultStops)
			form.select = async () => {
				throw new Error('No select fields')
			}
			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(model.valid, 'okvalue')
			assert.strictEqual(model.invalid, undefined)
			assert.strictEqual(model.stringProp, undefined)
		})
	})

	describe('requireInput', () => {
		let form

		beforeEach(() => {
			const user = new User()
			form = new Form(user, { stops: defaultStops })
		})

		it('should complete text input successfully with predefined answers', async () => {
			const predefined = createPredefinedInput(['validuser', '25'], mockConsole, defaultStops)
			form.handler = predefined

			let selectCalls = 0
			form.select = async (config) => {
				selectCalls++
				assert.equal(config.title, 'Pick a color')
				return { index: 1, value: 'Green' }
			}

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(form.body.username, 'validuser')
			assert.strictEqual(form.body.age, 25)
			assert.strictEqual(form.body.color, 'Green')
			assert.strictEqual(selectCalls, 1)
		})

		it('should retry on validation error for a field', async () => {
			const predefined = createPredefinedInput(
				['invalid@username', 'validuser', '25'],
				mockConsole,
				defaultStops
			)
			form.handler = predefined

			let selectCalls = 0
			form.select = async () => {
				selectCalls++
				return { index: 1, value: 'Green' }
			}

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(form.body.username, 'validuser')
			assert.strictEqual(form.body.age, 25)
			assert.strictEqual(form.body.color, 'Green')
			assert.strictEqual(selectCalls, 1)
		})

		it('should handle select field successfully', async () => {
			const predefined = createPredefinedInput(['validuser', '25'], mockConsole, defaultStops)
			form.handler = predefined

			let selectCalls = 0
			form.select = async () => {
				selectCalls++
				return { index: 1, value: 'Green' }
			}

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(form.body.color, 'Green')
			assert.strictEqual(selectCalls, 1)
		})

		it('should cancel on stop word and return {cancelled: true}', async () => {
			const predefined = createPredefinedInput(['cancel'], mockConsole, defaultStops)
			form.handler = predefined

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, true)
			assert.strictEqual(form.body.username, '')
		})

		it('should skip non-required empty input', async () => {
			class Optional {
				static opt = {
					help: 'Optional',
					required: false,
					defaultValue: '',
					validate: () => true,
				}
				constructor() {
					this.opt = ''
				}
			}
			const model = new Optional()
			const f = new Form(model, { stops: defaultStops })
			const predefined = createPredefinedInput([''], mockConsole, defaultStops)
			f.handler = predefined

			const result = await f.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(f.body.opt, '')
		})

		it('should handle CancelError from select', async () => {
			const predefined = createPredefinedInput(['validuser', '25'], mockConsole, defaultStops)
			form.handler = predefined

			let selectCalls = 0
			form.select = async () => {
				selectCalls++
				throw new CancelError()
			}

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, true)
			assert.strictEqual(selectCalls, 1)
			assert.strictEqual(form.body.username, 'validuser')
			assert.strictEqual(form.body.age, 25)
			assert.strictEqual(form.body.color, '')
		})
	})

	describe('convertValue', () => {
		it('should convert to string by default', () => {
			class Model {
				static str = { defaultValue: '' }
				static num = { type: 'number', defaultValue: 0 }
				static bool = { type: 'boolean', defaultValue: false }
			}
			const model = new Model()
			const form = new Form(model)

			assert.strictEqual(form.convertValue({ name: 'str' }, 'test'), 'test')
			assert.strictEqual(form.convertValue({ name: 'num' }, '42'), 42)
			assert.strictEqual(form.convertValue({ name: 'bool' }, 'true'), true)
			assert.strictEqual(form.convertValue({ name: 'bool' }, 'false'), false)
			assert.strictEqual(form.convertValue({ name: 'bool' }, ''), false)
		})
	})

	describe('body getter', () => {
		it('should return the updated model instance', () => {
			class User {
				constructor() {
					this.username = ''
				}
			}
			const user = new User()
			const form = new Form(user)
			user.username = 'test'
			assert.strictEqual(form.body, user)
			assert.strictEqual(form.body.username, 'test')
		})
	})

	describe('i18n and Unicode support', () => {
		it('should translate field labels and help text', async () => {
			class I18nModel {
				static field = { help: 'Original Label' }
				constructor() {
					this.field = ''
				}
			}
			const model = new I18nModel()
			const t = (key) => (key === 'Original Label' ? 'Перекладена мітка' : key)
			const form = new Form(model, { t })

			assert.strictEqual(form.fields[0].label, 'Перекладена мітка')
		})

		it('should support Unicode (Cyrillic) in inputs and validation', async () => {
			class UnicodeModel {
				static name = {
					help: 'Name',
					validate: (v) => (v.length > 0 ? true : 'Empty'),
				}
				constructor() {
					this.name = ''
				}
			}
			const model = new UnicodeModel()
			const form = new Form(model, { stops: defaultStops })
			form.handler = createPredefinedInput(['ЯRаслав'], mockConsole, defaultStops)

			const result = await form.requireInput()
			assert.strictEqual(result.cancelled, false)
			assert.strictEqual(model.name, 'ЯRаслав')
		})
	})
})
