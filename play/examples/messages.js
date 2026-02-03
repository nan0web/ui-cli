/**
 * UI‑CLI message utilities.
 *
 * Provides human‑readable messages for the **serve** and **dump**
 * commands and a composite message that aggregates both.
 *
 * @module play/examples/messages
 */

import { ServeBody } from './serveBody.js'
import { DumpBody } from './dumpBody.js'

/**
 * Build a human‑readable message for the **serve** command.
 *
 * @param {import("./serveBody.js").ServeBody} opts
 * @returns {string}
 */
export function serveMessage(opts) {
	const base = `Starting server on port ${opts.port}`
	return opts.ssl ? `${base} with SSL (${opts.ssl})` : base
}

/**
 * Build a human‑readable message for the **dump** command.
 *
 * @param {import("./dumpBody.js").DumpBody} opts
 * @returns {string}
 */
export function dumpMessage(opts) {
	return `Dumping build to ${opts.dist}`
}

/**
 * Composite message that contains children commands.
 *
 * @typedef {Object} MainMessage
 * @property {{command:string, message:string}[]} children
 */

/** @type {MainMessage} */
export const MainMessage = {
	children: [
		{ command: 'serve', message: serveMessage(ServeBody) },
		{ command: 'dump', message: dumpMessage(DumpBody) },
	],
}
