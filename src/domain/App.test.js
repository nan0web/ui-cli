import { describe, it } from 'node:test'
import assert from 'node:assert'

import { DB } from '@nan0web/db'

import { App } from './App.js'
import { ModelAsApp } from './ModelAsApp.js'

class MockMockModel extends ModelAsApp {
	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		yield { type: 'log', message: 'Mocked!' }
		return { type: 'result', data: { success: true } }
	}
}

describe('App _runModule routing', () => {
	it('should route target dynamically via _runModule', async () => {
		const app = new App()
		app._import = async (specifier) => {
			return { default: MockMockModel }
		}

		app.target = 'src/index.js'
		let shown = false
		for await (const intent of app.run()) {
			if (intent.type === 'log' || intent.message === 'Mocked!') shown = true
		}
		assert.ok(shown, 'Target module was dynamically imported and executed')
	})
})

describe('App _runRemote (HTTP/HTTPS thin client)', () => {
	it('should handle remote session with progress and result intents', async () => {
		const app = new App()
		const url = 'http://localhost:3000/api'

		let fetchCalls = 0
		/** @type {any} */
		global.fetch = async (reqUrl, options) => {
			fetchCalls++
			assert.strictEqual(reqUrl, url)

			if (fetchCalls === 1) {
				return {
					ok: true,
					json: async () => ({
						sessionId: 'session-123',
						intent: { type: 'progress', message: 'Work in progress', percent: 50 },
						done: false,
					}),
				}
			}

			return {
				ok: true,
				json: async () => ({
					sessionId: 'session-123',
					intent: { type: 'result', data: { status: 'ok' } },
					done: true,
				}),
			}
		}

		const intents = []
		for await (const intent of app._runRemote(url)) {
			intents.push(intent)
		}

		assert.strictEqual(
			fetchCalls,
			2,
			'Two fetch calls were made (one for progress, one for result)'
		)
		// First intent is usually "Connecting..." (log)
		assert.ok(
			intents.some((i) => i.type === 'progress' && i.value === 50),
			'Progress intent was yielded (note: percent maps to value)'
		)
		assert.ok(
			intents.some((i) => i.type === 'show' && i.message.includes('"status": "ok"')),
			'Result data was shown'
		)
		assert.ok(
			intents.some((i) => i.type === 'show' && i.message.includes('Session finished.')),
			'Completion message was shown'
		)
	})

	it('should yield ask intent and send answer back to remote', async () => {
		const app = new App()
		const url = 'https://remote.app/api'

		let lastBody = null
		/** @type {any} */
		global.fetch = async (reqUrl, options) => {
			lastBody = JSON.parse(options.body)
			if (!lastBody.answer) {
				return {
					ok: true,
					json: async () => ({
						sessionId: 'sess-456',
						intent: { type: 'ask', prompt: 'Your name?' },
						done: false,
					}),
				}
			}
			return {
				ok: true,
				json: async () => ({
					sessionId: 'sess-456',
					intent: { type: 'result', data: 'Hello ' + lastBody.answer.value },
					done: true,
				}),
			}
		}

		const iter = app._runRemote(url)

		// 1. Initial "Connecting" log
		const init = await iter.next()
		assert.strictEqual(/** @type {any} */ (init.value).type, 'show')

		// 2. Get Ask Intent
		const first = await iter.next()
		assert.strictEqual(/** @type {any} */ (first.value).type, 'ask')
		assert.strictEqual(/** @type {any} */ (first.value).prompt, 'Your name?')

		// 3. Feed answer back
		const second = await iter.next({ value: 'Alice' })

		assert.strictEqual(
			lastBody.answer.value,
			'Alice',
			'Answer was correctly sent in the second fetch body'
		)
		assert.ok(
			/** @type {any} */ (second.value).message.includes('Hello Alice'),
			'Remote response with answer was processed'
		)

		await iter.next() // Finalize
	})
})
