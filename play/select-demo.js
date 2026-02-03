/**
 * Select demo – exercises the UI‑CLI select utility.
 *
 * @module play/select-demo
 */

import Logger from '@nan0web/log'
import { Message } from '@nan0web/co'
import CLIInputAdapter from '../src/InputAdapter.js'
import { OutputMessage } from '@nan0web/ui'

export class SelectBody {
	color
	static color = {
		help: 'Pick a colour',
		options: ['Red', 'Green', 'Blue'],
		defaultValue: '',
	}
	/** @param {Partial<SelectBody>} input */
	constructor(input = {}) {
		const { color = '' } = input
		this.color = String(color)
	}
}

export class SelectDemo extends Message {
	static name = 'select'
	static help = 'Select Prompt Demo'
	static Body = SelectBody
	/** @type {SelectBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = new SelectBody(input.body ?? {})
	}
	/** @returns {typeof SelectBody} */
	get Body() {
		return /** @type {typeof SelectDemo} */ (this.constructor).Body
	}
	/**
	 * @param {any} input
	 * @returns {SelectDemo}
	 */
	static from(input) {
		if (input instanceof SelectDemo) return input
		return new SelectDemo(input)
	}
}

export default class SelectDemoCLi extends SelectDemo {
	async requireInput() {
		// @todo check if the data provided with CommandParser, use CommandHelp and UIForm if needed
		// to get the all information inside the SelectDemo message until it's valid or operation cancelled.
		// This way I need to descript only Messages with their bodies as contracts for their operations (run)
	}
	/**
	 * @param {{ console: import("../src/ui/select").ConsoleLike, adapter: CLIInputAdapter }} context
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	async *run() {
		await this.requireInput()
		yield new OutputMessage(`✓ You selected: ${value}`)
	}
}

/**
 * Run the select demo.
 * @deprecated @todo must be changed with the Message / CLI processing
 * @param {Logger} console - Logger instance.
 * @param {CLIInputAdapter} adapter - Adapter that provides predefined answer handling.
 * @param {Function} t - Translation function.
 */
export async function runSelectDemo(console, adapter, t) {
	console.clear()
	console.success(t('Select Prompt Demo'))

	// Pass the real logger as `console` so the colour menu appears.
	const value = await adapter.requestSelect({
		title: t('Pick a colour'),

		options: [
			{ label: t('Red'), value: 'Red' },
			{ label: t('Green'), value: 'Green' },
			{ label: t('Blue'), value: 'Blue' }
		],
		console, // <-- keep output consistent with manual run
	})

	if (value === undefined) {
		console.warn(t('Selection cancelled.'))
		return
	}

	console.info(`✓ ${t('You selected:')} ${t(value)}`)
}
