/**
 * UiMessage demo – demonstrates using `UiMessage` with a schema‑derived form.
 *
 * @module play/ui-message-demo
 */

import Logger from '@nan0web/log'
import { UiMessage } from '@nan0web/ui'

/**
 * Body schema used by the demo message.
 */
class DemoBody {
	static username = {
		help: 'User name',
		required: true,
		validate: (v) => (/^\w+$/.test(v) ? true : 'Alphanumeric only'),
	}
	static age = {
		help: 'User age',
		type: 'number',
		required: true,
		validate: (v) => (Number(v) >= 18 ? true : 'Must be 18+'),
	}
	static color = {
		help: 'Favorite colour',
		options: ['Red', 'Green', 'Blue'],
		defaultValue: 'Red',
	}
	constructor(input = {}) {
		const { username = '', age = 0, color = DemoBody.color.defaultValue } = input
		this.username = String(username)
		this.age = Number(age)
		this.color = String(color)
	}
}

/**
 * Message class extending UiMessage.
 */
class DemoMessage extends UiMessage {
	static Body = DemoBody
	/** @type {DemoBody} */
	body
	constructor(input = {}) {
		super(input)
		const { body = new DemoBody() } = input
		this.body = new DemoBody(body)
	}
}

/**
 * Run the demo – uses the provided CLI adapter for interaction.
 *
 * @param {Logger} console - Logger instance.
 * @param {import("../../src/InputAdapter.js").default} adapter - Input adapter.
 */
export async function runUiMessageDemo(console, adapter) {
	console.clear()
	console.success('UiMessage Demo – Schema‑driven Form')

	const msg = new DemoMessage({ body: {} })

	const result = await adapter.requireInput(msg)

	if (result.cancelled) {
		console.info('Form cancelled by user.')
		return
	}

	console.success('Form completed!')
	console.info(
		`Result → ${JSON.stringify({
			...result,
			age: Number(result.age),
		})}`,
	)
}
