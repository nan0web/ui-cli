/**
 * Basic UI‑CLI demo – shows simple logging.
 *
 * @module play/basic-demo
 */

import Logger from '@nan0web/log'

/**
 * Run the basic demo.
 *
 * @param {Logger} console - Logger instance.
 * @param {Function} t - Translation function.
 */
export async function runBasicDemo(console, t) {
	console.clear()
	console.success(t('Basic Logging Demo'))

	console.info(`✓ ${t('Logger initialized')}`)
	console.info(`✓ ${t('This demo simply logs messages')}`)
}
