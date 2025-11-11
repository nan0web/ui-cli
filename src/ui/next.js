/**
 * Utility functions for handling pauses and key‑press continuations.
 *
 * @module ui/next
 */

import process from "node:process"

/**
 * Pause execution for a given amount of milliseconds.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<true>} Resolves with `true` after the timeout.
 */
export async function pause(ms) {
	return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

/**
 * Wait for any key press (or a specific sequence).
 *
 * @param {string|string[]|undefined} [conf] - Expected key or sequence.
 * @returns {Promise<string>} The captured key/sequence.
 * @throws {Error} If stdin is already in raw mode.
 */
export async function next(conf = undefined) {
	return new Promise((resolve, reject) => {
		if (process.stdin.isRaw) {
			reject(new Error("stdin is already in raw mode"))
			return
		}
		let buffer = ""

		const onData = chunk => {
			const str = chunk.toString()
			buffer += str

			if (conf === undefined) {
				cleanup()
				resolve(str)
			} else if (typeof conf === "string") {
				if (buffer === conf || buffer.endsWith(conf)) {
					cleanup()
					resolve(buffer)
				}
			} else if (Array.isArray(conf)) {
				for (const seq of conf) {
					if (buffer === seq || buffer.endsWith(seq)) {
						cleanup()
						resolve(seq)
						break
					}
				}
			}
		}

		const errorHandler = err => {
			cleanup()
			reject(err)
		}

		const cleanup = () => {
			process.stdin.off("data", onData)
			process.stdin.off("error", errorHandler)
			process.stdin.setRawMode(false)
			process.stdin.resume()
		}

		process.stdin.setRawMode(true)
		process.stdin.resume()
		process.stdin.once("error", errorHandler)
		process.stdin.on("data", onData)
	})
}