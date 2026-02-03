/**
 * Table demo – demonstrates using `table` with live filtering.
 *
 * @module play/table-demo
 */

import Logger from '@nan0web/log'


const MODELS_DATA = [
    { id: 'gpt-4', provider: 'OpenAI', context: '128k', cost: '10$' },
    { id: 'gpt-3.5-turbo', provider: 'OpenAI', context: '16k', cost: '0.5$' },
    { id: 'claude-3-opus', provider: 'Anthropic', context: '200k', cost: '15$' },
    { id: 'claude-3-sonnet', provider: 'Anthropic', context: '200k', cost: '3$' },
    { id: 'gemini-1.5-pro', provider: 'Google', context: '1M', cost: '7$' },
    { id: 'llama-3-70b', provider: 'Meta', context: '8k', cost: 'free' },
    { id: 'mistral-large', provider: 'Mistral', context: '32k', cost: '8$' },
]

/**
 * Run the table demo.
 *
 * @param {Logger} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 */
export async function runTableDemo(console, adapter) {
    console.clear()
    console.success('Interactive Table Demo (Limo Models)')

    await adapter.requestTable({
        data: MODELS_DATA,
        title: 'Available AI Models',
        columns: ['id', 'provider', 'context', 'cost'],
        interactive: true
    })

    console.info('Table interaction finished.')
}

/**
 * Run the instant table demo.
 *
 * @param {Logger} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 */
export async function runInstantTableDemo(console, adapter) {
    console.clear()
    console.success('Instant Table Filtering Demo')
    console.info('Type characters to see immediate filtering results.')

    await adapter.requestTable({
        data: MODELS_DATA,
        title: 'Available AI Models',
        columns: ['id', 'provider', 'context', 'cost'],
        interactive: true,
        instant: true
    })

    console.info('Instant table interaction finished.')
}
