/**
 * DateTime Picker Demo.
 * @module play/datetime-demo
 */

/**
 * Run the datetime picker demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runDateTimeDemo(console, adapter, t) {
    console.clear()
    console.success(t('DateTime Picker Demo'))

    // Scenario 1: Basic Date Selection
    console.info('\n' + t('Scenario 1: Select a Date'))
    const dateResult = await adapter.requestDateTime({
        message: 'Pick a date:',
        initial: new Date('2026-01-01T12:00:00')
    })
    console.info(`${t('You selected:')} ${dateResult ? dateResult.toISOString().split('T')[0] : t('(empty)')}`)

    // Scenario 2: Select Time (HH:mm)
    console.info('\n' + t('Scenario 2: Select Time (HH:mm)'))
    const timeResult = await adapter.requestDateTime({
        message: 'Pick a time:',
        mask: 'HH:mm'
    })
    const timeStr = timeResult ? `${String(timeResult.getHours()).padStart(2, '0')}:${String(timeResult.getMinutes()).padStart(2, '0')}` : t('(empty)')
    console.info(`${t('You selected time:')} ${timeStr}`)

    // Scenario 3: Full Date & Time
    console.info('\n' + t('Scenario 3: Full Date & Time'))
    const fullResult = await adapter.requestDateTime({
        message: 'Pick full date and time:',
        mask: 'YYYY-MM-DD HH:mm'
    })
    const fullStr = fullResult ? fullResult.toISOString().replace('T', ' ').substring(0, 16) : t('(empty)')
    console.info(`${t('You selected:')} ${fullStr}`)

    await adapter.pause(t('Press any key to continue...'))
}
