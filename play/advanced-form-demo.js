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
 */
export async function runAdvancedFormDemo(console, adapter) {
    console.clear()
    console.success('Advanced Form Demo – Security & Toggles')
    console.info('Testing password masking and boolean fields.')

    const form = new UiForm({
        fields: [
            { name: 'username', label: 'Login', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
            { name: 'phone', label: 'Phone', type: 'mask', mask: '(###) ###-####', required: true },
            { name: 'rememberMe', label: 'Remember me?', type: 'confirm' },
            {
                name: 'roles',
                label: 'Select your roles',
                type: 'multiselect',
                options: ['Admin', 'Editor', 'Viewer']
            }
        ]
    })

    try {
        const result = await adapter.requestForm(form)

        if (result.cancelled) {
            console.warn('Form cancelled.')
            return
        }

        console.success('Form submitted!')
        console.info('Form data (password is hidden here):')
        const displayData = { ...result.form.state }
        displayData.password = '********'
        console.log(JSON.stringify(displayData))
    } catch (error) {
        if (error.message?.includes('cancel')) {
            console.warn('\nOperation cancelled by user.')
        } else {
            console.error(error)
        }
    }
}
