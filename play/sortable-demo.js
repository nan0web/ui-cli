/**
 * Sortable demo – interactive reorderable list in CLI.
 *
 * Uses adapter.requestSortable() which delegates to sortable() internally.
 *
 * @module play/sortable-demo
 */

/**
 * Run the sortable demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runSortableDemo(console, adapter, t) {
	console.clear()
	console.success(t('Sortable Demo'))
	console.info(t('Reorder items using ↑/↓ to navigate, Space to grab, then ↑/↓ to move.'))
	console.info('')

	// Scenario 1: Priority reorder
	console.info(t('Scenario 1: Reorder priorities'))
	const result = await adapter.requestSortable({
		message: t('Set priority order:'),
		items: [
			{ label: '🔴 ' + t('Critical'), value: 'critical' },
			{ label: '🟠 ' + t('High'), value: 'high' },
			{ label: '🟡 ' + t('Medium'), value: 'medium' },
			{ label: '🟢 ' + t('Low'), value: 'low' },
		],
	})
	console.success(`${t('Final order:')} ${result.value.join(' → ')}`)
}
