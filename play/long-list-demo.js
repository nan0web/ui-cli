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
 */
export async function runLongListDemo(console, adapter) {
    console.clear()
    console.success('Long List Demo – Scrolling Support')
    console.info('Generating 100 items... Only 10 will be visible at once.')

    const items = Array.from({ length: 100 }, (_, i) => ({
        label: `Option #${i + 1} ${i === 42 ? '✨' : ''}`,
        value: i + 1
    }))

    const result = await adapter.requestSelect({
        title: 'Scroll through the 100 items:',
        options: items,
        limit: 10,
        console: { info: console.info.bind(console) }
    })

    if (result === undefined) {
        console.warn('No selection made.')
    } else {
        console.success(`Selected item ID: ${result}`)
    }
}
