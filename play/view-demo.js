/**
 * View Components Demo – showcases Badge, Alert, and Toast.
 *
 * @module play/view-demo
 */

import { badge, alert, toast } from '../src/index.js'

/**
 * Run the view components demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runViewDemo(console, adapter, t) {
    console.clear()
    console.success(t('View Components Demo'))

    console.info('\n--- ' + t('BADGES') + ' ---')
    console.info(`${t('Status:')} ${badge(t('Online'), 'success')}  ${badge(t('Offline'), 'neutral')}  ${badge(t('Error'), 'error')}`)
    console.info(`${t('Level:')}  ${badge(t('Info'), 'info')}    ${badge(t('Warning'), 'warning')}`)

    console.info('\n--- ' + t('TOASTS') + ' ---')
    console.info(toast(t('Operation successful'), 'success'))
    console.info(toast(t('System update available'), 'info'))
    console.info(toast(t('Low disk space'), 'warning'))
    console.info(toast(t('Connection failed'), 'error'))

    console.info('\n--- ' + t('ALERTS') + ' ---')

    // Basic Info
    console.info(alert(t('This is a standard info alert.\nIt captures attention without being alarmist.'), 'info'))

    // Success with Title
    console.info(alert(t('Deployment completed successfully!\nAll tests passed.'), 'success', {
        title: t('Great Success')
    }))

    // Warning
    console.info(alert(t('Dependencies are outdated.\nRun update to fix security issues.'), 'warning', {
        title: t('Security Warning'),
        sound: false // Don't beep in demo loop
    }))

    // Error
    console.info(alert(t('Critical system failure.\nUnable to connect to database.'), 'error', {
        title: t('Fatal Error'),
        sound: false
    }))

    await adapter.pause(t('Press any key to continue...'))
}
