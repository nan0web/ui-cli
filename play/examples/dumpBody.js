import { GlobalBody } from "./globalBody.js"

/**
 * Options for the `dump` command.
 *
 * Extends {@link GlobalBody}.
 *
 * @typedef {Object} DumpBody
 * @property {string} dist – output directory (default `"./dist"`)
 */

/** @type {DumpBody} */
export const DumpBody = {
	...GlobalBody,
	dist: "./dist",
}