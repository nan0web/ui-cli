import process from "node:process"

/**
 * Make a pause.
 * @param {number} ms - Amount in miliseconds
 * @returns {Promise<void>}
 */
const pause = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Waits for the confirmation message (input) from user
 * @param {string | string[] | undefined} conf - Confirmation message or one of messages if array or any if undefined.
 * @returns {Promise<string>}
 */
const next = async (conf = undefined) => {
	return new Promise((resolve, reject) => {
		if (process.stdin.isRaw) {
			reject(new Error('stdin is already in raw mode'))
			return
		}

		let buffer = ''

		const onData = (chunk) => {
			const str = chunk.toString()
			buffer += str

			// Будь-яка клавіша
			if (conf === undefined) {
				cleanup()
				resolve(str)
			}
			else if (typeof conf === 'string') {
				if (buffer === conf || buffer.endsWith(conf)) {
					cleanup()
					resolve(buffer)
				}
			}
			else if (Array.isArray(conf)) {
				for (const seq of conf) {
					if (buffer === seq || buffer.endsWith(seq)) {
						cleanup()
						resolve(seq)
						break
					}
				}
			}
		}

		const errorHandler = (err) => {
			cleanup()
			reject(err)
		}

		const cleanup = () => {
			process.stdin.off('data', onData)
			process.stdin.off('error', errorHandler)
			process.stdin.setRawMode(false)
			process.stdin.resume()
		}

		process.stdin.setRawMode(true)
		process.stdin.resume()

		process.stdin.once('error', errorHandler)
		process.stdin.on('data', onData)
	})
}

export { next, pause }
