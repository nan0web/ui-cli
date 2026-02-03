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
 */
export async function runBasicDemo(console) {
	console.clear()
	console.success('Basic UI‑CLI Demo')

	console.info('✓ Logger initialized')
	console.info('✓ This demo simply logs messages')
}
