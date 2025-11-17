/**
 * Global CLI options shared by all commands.
 *
 * @typedef {Object} GlobalBody
 * @property {boolean} help    – show help (default `false`)
 * @property {boolean} version – show version (default `false`)
 * @property {boolean} debug   – enable debug output (default `false`)
 */

/** @type {GlobalBody} */
export const GlobalBody = {
	help: false,
	version: false,
	debug: false,
}