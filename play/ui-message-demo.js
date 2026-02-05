/**
 * UiMessage demo – demonstrates using `UiMessage` with a schema‑derived form.
 *
 * @module play/ui-message-demo
 */

import { UiMessage } from '@nan0web/ui'

export async function runUiMessageDemo(console, adapter, t) {
	console.clear()
	console.success(t('UiMessage Demo – Schema‑driven Form'))

	/**
	 * Body schema used by the demo message.
	 */
	class DemoBody {
		static username = {
			help: 'User name',
			required: true,
			validate: (v) => (v.trim().length > 0 ? true : t('Username is required (supports any language)')),
		}
		static age = {
			help: 'User age',
			type: 'number',
			required: true,
			validate: (v) => (Number(v) >= 18 ? true : t('Must be 18+')),
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

	const msg = new DemoMessage({ body: {} })

	const result = await adapter.requireInput(msg)

	if (result.cancelled) {
		console.info(t('Form cancelled by user.'))
		return
	}

	console.success(t('Form completed!'))
	console.info(
		`${t('Result →')} ${JSON.stringify({
			...result,
			age: Number(result.age),
		})}`,
	)
}
