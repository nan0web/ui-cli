import { UiForm, FormInput } from '@nan0web/ui'

/**
 * Creates a user registration form
 * @param {Function} t - Translation function
 * @returns {UiForm} User registration form
 */
export function createUserForm(t) {
	return new UiForm({
		title: t('User Registration Form'),
		id: 'user-registration',
		state: {},
		fields: [
			new FormInput({
				name: 'name',
				label: t('Full name'),
				required: true
			}),
			new FormInput({
				name: 'email',
				label: t('Email address'),
				type: FormInput.TYPES.EMAIL,
				required: true
			}),
			new FormInput({
				name: 'phone',
				label: t('Phone number'),
				type: FormInput.TYPES.TEXT,
				validator: (value) => {
					if (!value) return null
					return value.length >= 10 && value.length <= 15 ? null : t('Invalid phone number')
				},
				required: false
			})
		]
	})
}
