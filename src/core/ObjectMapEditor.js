import { Form } from '../ui/form.js'
import PreviewRenderer from './PreviewRenderer.js'

/**
 * Object Map Form Editor — renders an interactive field-by-field
 * editor for Model-as-Schema instances in CLI.
 *
 * Extracted from CLiInputAdapter.renderForm().
 */
export default class ObjectMapEditor {
	/**
	 * Build an editor controller for the given data + schema.
	 *
	 * @param {import('../InputAdapter.js').default} adapter
	 * @param {Object} data - Initial document data.
	 * @param {Function} SchemaClass - Schema constructor with static fields.
	 * @returns {{fill: () => Promise<any>}} Form object with fill method.
	 */
	static create(adapter, data, SchemaClass) {
		const form = new Form(data, {
			t: adapter.t,
			inputFn: (p) => /** @type {any} */ (adapter.requestInput({ message: p })),
			selectFn: (cfg) => adapter.requestSelect(cfg),
			toggleFn: (cfg) => adapter.requestToggle(cfg),
			sliderFn: (cfg) => adapter.requestSlider(cfg),
			console: adapter.console,
		})

		const fields = form.fields
		adapter.console.debug('renderForm: Fields found:', fields.map((f) => f.name).join(', '))
		if (fields.length === 0) {
			adapter.console.debug('renderForm: No fields found in schema', SchemaClass.name)
		}

		return {
			fill: async () => {
				let lastIndex = 0
				while (true) {
					// 1. Mock Render the Component live for visual feedback (Only if it's a Component Schema)
					const isComponent =
						data.constructor.name.endsWith('Model') && data.constructor.name !== 'SandboxModel'
					if (isComponent) {
						const componentName = data.constructor.name.replace('Model', '')
						await PreviewRenderer.renderPreview(adapter, data, componentName)
					}

					// Prepare choices: Field [Value]
					const choices = [
						...fields.map((f) => {
							const val = data[f.name] ?? ''
							let displayVal = val

							if (typeof val === 'boolean') {
								displayVal = val ? adapter.t('Yes') : adapter.t('No')
							} else if (typeof val === 'object' && val !== null) {
								displayVal = JSON.stringify(val)
							}

							if (typeof displayVal === 'string' && displayVal.length > 50) {
								displayVal = displayVal.slice(0, 47) + '...'
							}

							return {
								label: `${f.label}: [${displayVal}]`,
								value: f.name,
							}
						}),
						{ label: '──────────────────────────', value: 'sep', disabled: true },
						{ label: `✅ ${adapter.t('Save and exit')}`, value: '_save' },
						{ label: `❌ ${adapter.t('Cancel changes')}`, value: '_cancel' },
					]

					const selectedField = await adapter.requestSelect({
						title: `📝 ${adapter.t('Edit:')} ${adapter.t(SchemaClass.name)}`,
						message: adapter.t('Select field to edit:'),
						options: choices,
						limit: 15,
						initial: lastIndex,
					})

					if (selectedField.cancelled || selectedField.value === '_cancel') {
						return { value: data, cancelled: true }
					}

					if (selectedField.value === '_save') {
						return { value: data, cancelled: false }
					}

					if (typeof selectedField.index === 'number' && selectedField.index >= 0) {
						lastIndex = selectedField.index
					}
					const field = fields.find((f) => f.name === selectedField.value)
					if (!field) continue

					// Determine current value for initial
					const currentValue = data[field.name]

					let result
					if (field.options && field.options.length) {
						// Always use SelectBox if options are explicitly defined (e.g. variants, sizes)
						result = await adapter.requestSelect({
							message: field.label,
							options: field.options,
							initial: currentValue,
						})
					} else if (field.type === 'toggle' || field.type === 'boolean') {
						// Toggle (Yes/No) is better UX for booleans
						result = await adapter.requestToggle({
							message: field.label,
							initial: currentValue === true,
							active: field.active || adapter.t('Yes'),
							inactive: field.inactive || adapter.t('No'),
						})
					} else if (field.type === 'select') {
						result = await adapter.requestSelect({
							message: field.label,
							options: field.options,
							initial: currentValue,
						})
					} else if (field.type === 'mask') {
						result = await adapter.requestMask({
							message: field.label,
							mask: field.mask,
							initial: currentValue,
						})
					} else if (field.type === 'slider') {
						result = await adapter.requestSlider({
							message: field.label,
							min: field.min,
							max: field.max,
							step: field.step,
							initial: currentValue,
						})
					} else {
						result = await adapter.requestInput({
							message: field.label,
							initial:
								typeof currentValue === 'object' && currentValue !== null
									? JSON.stringify(currentValue)
									: (currentValue ?? field.placeholder),
							validate: field.validation,
						})
					}

					if (!result.cancelled && result.value !== undefined) {
						data[field.name] = form.convertValue(field, /** @type {any} */ (result.value))
					}
				}
			},
		}
	}
}
