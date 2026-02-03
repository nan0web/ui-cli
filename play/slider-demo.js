/**
 * Slider demo – exercises the UI‑CLI slider utility with various ranges.
 *
 * @module play/slider-demo
 */

/**
 * Run the slider demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runSliderDemo(console, adapter, t) {
    console.clear()
    console.success(t('Slider Demo'))

    // 1. Volume (0-100)
    const volume = await adapter.requestSlider({
        message: t('Select Volume') + ' (0-100)',
        min: 0,
        max: 100,
        step: 1,
        initial: 50
    })
    console.info(`${t('Selected:')} ${volume}`)

    // 2. Speed (0-1000)
    const speed = await adapter.requestSlider({
        message: t('Select Speed') + ' (0-1000)',
        min: 0,
        max: 1000,
        step: 10,
        initial: 500
    })
    console.info(`${t('Selected:')} ${speed}`)

    // 3. Reward (0-1,000,000)
    const reward = await adapter.requestSlider({
        message: t('Select Reward') + ' (0-1M)',
        min: 0,
        max: 1000000,
        step: 1000,
        initial: 50000
    })
    console.info(`${t('Selected:')} ${reward}`)

    // 4. Disk Size (0-1PB) - conceptual large number
    // 1PB = 1,000,000,000,000,000 bytes. Let's use TB unit: 0-1000 TB.
    const disk = await adapter.requestSlider({
        message: t('Select Disk Size') + ' (TB)',
        min: 0,
        max: 1000,
        step: 1,
        initial: 100
    })
    console.info(`${t('Selected:')} ${disk}`)
}
