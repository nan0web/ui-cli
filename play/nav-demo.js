/**
 * Navigation Components Demo – showcases Breadcrumbs, Tabs, and Steps.
 *
 * @module play/nav-demo
 */

import { breadcrumbs, tabs, steps } from '../src/index.js'

/**
 * Run the navigation components demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runNavDemo(console, adapter, t) {
    console.clear()
    console.success(t('Navigation Components Demo'))

    console.info('\n--- ' + t('BREADCRUMBS') + ' ---')
    console.info(breadcrumbs([t('Home'), t('NanoWeb'), t('UI-CLI'), t('Demos')]))
    console.info(breadcrumbs([t('Users'), t('Admin'), t('Settings')], { separator: '/' }))

    console.info('\n--- ' + t('TABS') + ' ---')
    const generalTabs = [t('General'), t('Profile'), t('Security'), t('Notifications')]
    console.info(tabs(generalTabs, 0))
    console.info('\n' + tabs(generalTabs, 1))

    console.info('\n--- ' + t('STEPS (WIZARD)') + ' ---')
    const wizardSteps = [t('Cart'), t('Shipping'), t('Payment'), t('Review')]
    console.info(steps(wizardSteps, 0))
    console.info(steps(wizardSteps, 1))
    console.info(steps(wizardSteps, 2))
    console.info(steps(wizardSteps, 3))

    await adapter.pause(t('Press any key to continue...'))
}
