import Logger from '@nan0web/log'
import Form from '../src/ui/form.js'
import CLiInputAdapter from '../src/InputAdapter.js'

export async function runObjectFormDemo(console, adapter, t) {
	console.clear()
	console.success(t('Object Map Form Demo – Premium UX'))

	class Branch {
		static address = { help: 'Адреса', defaultValue: 'вул. Київська, 1' }
		static city = { help: 'Місто', defaultValue: 'Київ' }
		static onDuty = {
			help: 'На чергуванні',
			type: 'boolean',
			defaultValue: true,
			active: 'Так',
			inactive: 'Ні',
		}
		static type = {
			help: 'Тип',
			type: 'select',
			options: [
				{ label: 'Відділення', value: 'Branch' },
				{ label: 'Банкомат', value: 'ATM' },
			],
			defaultValue: 'Branch',
		}

		constructor(data = {}) {
			Object.assign(this, data)
		}
	}

	const branch = new Branch()

	console.info(t('Entering Object Map interface...'))

	try {
		// This triggers the new renderForm logic in InputAdapter.js
		const result = await adapter.renderForm(branch, Branch).fill()

		if (result.cancelled) {
			console.info(t('Editing cancelled.'))
			return
		}

		console.success(t('Data Saved:'))
		console.info(JSON.stringify(branch, null, 2))
	} catch (error) {
		console.error(`Error: ${error.message}`)
	}
}
