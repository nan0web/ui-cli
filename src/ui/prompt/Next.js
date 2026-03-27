import { createPrompt } from '../core/Component.js'
import { next } from '../impl/next.js'
import { NextModel } from '../../domain/prompt/NextModel.js'
import process from 'node:process'

export { NextModel }

/**
 * Prompts the user to press a key to continue.
 *
 * @param {NextModel|Object|string} props - Props or direct message.
 */
export function Next(props) {
	const model = new NextModel(props)

	return createPrompt('Next', model, async (p) => {
		if (p.UI) {
			const text = typeof p.console?.t === 'function' ? p.console.t(p.UI) : typeof p.t === 'function' ? p.t(p.UI) : p.UI;
			if (p.console && p.console.info) {
				p.console.info(text)
			} else {
				process.stdout.write(text + '\n')
			}
		}
		return await next(p.keys)
	})
}
