import { UiForm, FormInput } from '@nan0web/ui'

/**
 * Creates an age confirmation form
 * @param {Function} t - Translation function
 * @returns {UiForm} Age confirmation form
 */
export function createAgeForm(t) {
	return new UiForm({
		title: t('Age confirmation form'),
		id: 'age-confirmation',
		state: {},
		fields: [
			new FormInput({
				name: 'age',
				label: t('Please enter your age'),
				type: FormInput.TYPES.NUMBER,
				validator: (value) => {
					const num = Number(value)
					return num >= 18 ? null : t('You must be at least 18 years old')
				},
				required: true
			})
		]
	})
}
