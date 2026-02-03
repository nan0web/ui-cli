import { GlobalBody } from './globalBody.js'

/**
 * Options for the `serve` command.
 *
 * Extends {@link GlobalBody}.
 *
 * @typedef {Object} ServeBody
 * @property {number} port – listening port (default `3033`)
 * @property {string|undefined} ssl – comma‑separated paths to cert & key taken from env
 */

/** @type {ServeBody} */
export const ServeBody = {
	...GlobalBody,
	port: 3033,
	ssl:
		process.env.SSL_NAN0WEB_CERT && process.env.SSL_NAN0WEB_KEY
			? `${process.env.SSL_NAN0WEB_CERT},${process.env.SSL_NAN0WEB_KEY}`
			: undefined,
}
