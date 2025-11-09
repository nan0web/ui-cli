import { UIForm, FormInput } from '@nan0web/ui'

/**
 * Creates a profile update form
 * @param {Function} t - Translation function
 * @returns {UIForm} Profile update form
 */
export function createProfileForm(t) {
	return new UIForm({
		title: t('Profile update form'),
		id: 'profile-update',
		state: {},
		fields: [
			new FormInput({
				name: 'username',
				label: t('Username'),
				required: true
			}),
			new FormInput({
				name: 'bio',
				label: t('Biography'),
				type: FormInput.TYPES.TEXTAREA,
				required: false
			}),
			new FormInput({
				name: 'newsletter',
				label: t('Subscribe to newsletter'),
				type: FormInput.TYPES.CHECKBOX,
				required: false
			})
		]
	})
}
