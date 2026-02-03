import { UiForm, FormInput } from '@nan0web/ui'

/**
 * Creates an address information form
 * @param {Function} t - Translation function
 * @returns {UiForm} Address form
 */
export function createAddressForm(t) {
	return new UiForm({
		title: t('Address information'),
		id: 'address-form',
		state: {},
		fields: [
			new FormInput({
				name: 'street',
				label: t('Street'),
				required: true,
			}),
			new FormInput({
				name: 'city',
				label: t('City'),
				required: true,
			}),
			new FormInput({
				name: 'postalCode',
				label: t('Postal code'),
				type: FormInput.TYPES.TEXT,
				required: false,
			}),
			new FormInput({
				name: 'country',
				label: t('Country'),
				required: true,
			}),
		],
	})
}
