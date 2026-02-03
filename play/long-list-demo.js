/**
 * Long List demo – demonstrates the 'limit' functionality in select.
 *
 * @module play/long-list-demo
 */



/**
 * Run the long list demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runLongListDemo(console, adapter, t) {
    console.clear()
    console.success(t('Long List Demo – Scrolling Support'))
    console.info(`${t('Generating 100 items...')} ${t('Only 10 will be visible at once.')}`)

    const items = Array.from({ length: 100 }, (_, i) => ({
        label: `${t('Option')} #${i + 1} ${i === 42 ? '✨' : ''}`,
        value: i + 1
    }))

    const result = await adapter.requestSelect({
        title: t('Scroll through the 100 items:'),
        options: items,
        limit: 10,
        console: { info: console.info.bind(console) }
    })

    if (result === undefined) {
        console.warn(t('No selection made.'))
    } else {
        console.success(`${t('Selected item ID:')} ${result}`)
    }
}
