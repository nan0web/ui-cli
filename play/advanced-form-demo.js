/**
 * Advanced Form demo – demonstrates secret inputs and boolean toggles.
 *
 * @module play/advanced-form-demo
 */

import { UiForm } from '@nan0web/ui'

/**
 * Run the advanced form demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runAdvancedFormDemo(console, adapter, t) {
	console.clear()
	console.success(t('Advanced Form Demo'))
	console.info(t('Testing password masking and boolean fields.'))

	const form = new UiForm({
		title: t('Advanced Form Demo'),
		fields: [
			{ name: 'username', label: t('Login'), type: 'text', required: true },
			{ name: 'password', label: t('Password'), type: 'password', required: true },
			{ name: 'phone', label: t('Phone'), type: 'mask', mask: '(###) ###-####', required: true },
			{
				name: 'age',
				label: t('User age'),
				type: 'number',
				min: 18,
				max: 99,
				step: 1,
				required: true,
			},
			{ name: 'newsletter', label: t('Subscribe to newsletter'), type: 'toggle' },
			{ name: 'rememberMe', label: t('Remember me?'), type: 'confirm' },
			{
				name: 'roles',
				label: t('Select your roles'),
				type: 'multiselect',
				options: [
					{ label: t('Admin'), value: 'Admin' },
					{ label: t('Editor'), value: 'Editor' },
					{ label: t('Viewer'), value: 'Viewer' },
				],
			},
		],
	})

	try {
		const result = await adapter.requestForm(form)

		if (result.cancelled) {
			console.warn(t('Selection cancelled. Returning to menu...'))
			return
		}

		console.success(t('Form submitted!'))
		console.info(t('Form data (password is hidden here):'))
		const displayData = { ...result.form.state }
		displayData.password = '********'
		console.log(JSON.stringify(displayData))
	} catch (error) {
		if (error.message?.includes('cancel')) {
			console.warn(`\n${t('Selection cancelled. Returning to menu...')}`)
		} else {
			console.error(error)
		}
	}
}
