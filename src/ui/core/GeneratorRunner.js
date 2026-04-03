import { CancelError } from '@nan0web/ui/core'

/**
 * Universal Entry App Loop for OLMUI Apps.
 * Infinitely loops over an App/Entry Model until user fully exits.
 * 
 * @param {typeof Object|Function} AppEntryModel - The main application entry point class
 * @param {import('./InputAdapter.js').default} adapter - The CLI adapter
 * @param {Object} options 
 */
export async function runApp(AppEntryModel, adapter, options = {}) {
	const { t = (k) => k } = options
	if (adapter) adapter.t = t

	while (true) {
		try {
			// Ask the user to select a command from the app entry model
			const intent = {
				type: 'ask',
				field: 'app',
				model: true,
				schema: AppEntryModel,
			}
			
			const res = await adapter.askIntent(intent)
			if (res.cancelled) {
				adapter.console.info('')
				break
			}
			
			const selectedData = res.value
			if (!selectedData) continue

			// Extract command/model based on selection
			let commandToRun = null
			
			if (typeof selectedData.run === 'function') {
				commandToRun = selectedData
			} else if (selectedData.command) {
				const cmd = selectedData.command
				if (typeof cmd.run === 'function') {
					commandToRun = cmd
				} else if (typeof cmd === 'function') {
					// it's a class
					commandToRun = new cmd()
				}
			}

			if (commandToRun) {
				await runGenerator(commandToRun, adapter, options)
			}

		} catch (err) {
			const e = /** @type {any} */ (err)
			if (e instanceof CancelError || e?.message?.includes('Cancel') || e?.message === 'exit') {
				adapter.console.info('')
				break // Exit application on main level cancel
			}
			adapter.console.error(`Runtime Error: ${e.message}`)
		}
	}
}

/**
 * Executes an OLMUI intent generator, mapping intents to CLI adapter methods.
 * 
 * @param {Object} model - Pre-instantiated model possessing a run() generator
 * @param {import('./InputAdapter.js').default} adapter - CLI Adapter
 * @param {Object} options
 */
export async function runGenerator(model, adapter, options = {}) {
	const { t = (k) => k, db } = options
	if (adapter) adapter.t = t

	const iter = typeof model.run === 'function' ? model.run(options) : model
	if (!iter || typeof iter.next !== 'function') {
		throw new Error('Provided model does not have a run() generator or is not an iterator')
	}

	let nextVal = undefined
	let isThrowing = false
	let throwError = null

	while (true) {
		let res
		try {
			if (isThrowing) {
				isThrowing = false
				if (typeof iter.throw === 'function') {
					res = await iter.throw(throwError)
				} else {
					throw throwError
				}
			} else {
				res = await iter.next(nextVal)
			}
		} catch (generatorErr) {
			const e = /** @type {any} */ (generatorErr)
			if (e instanceof CancelError || e?.message?.includes('Cancel')) {
				return { success: false, data: undefined, cancelled: true }
			}
			throw generatorErr
		}

		if (res.done) {
			return { success: true, data: res.value, cancelled: false }
		}

		const intent = res.value
		if (!intent || !intent.type) {
			nextVal = intent
			continue
		}

		try {
			switch (intent.type) {
				case 'ask': {
					const askRes = await adapter.askIntent(intent)
					if (askRes.cancelled) {
						throw new CancelError('User cancelled intent')
					}
					nextVal = askRes
					break
				}
				case 'progress': {
					nextVal = await adapter.progressIntent(intent)
					break
				}
				case 'log': {
					await adapter.logIntent(intent)
					nextVal = undefined
					break
				}
				case 'render':
				case 'renderComponent': {
					if (typeof adapter.render === 'function') {
						await adapter.render(intent.component, intent.props)
					}
					nextVal = undefined
					break
				}
				case 'result': {
					if (typeof adapter.resultIntent === 'function') {
						await adapter.resultIntent(intent)
					} else {
						// Fallback if older adapter used
						const content = intent.data && typeof intent.data === 'object' 
							? JSON.stringify(intent.data, null, 2) 
							: String(intent.data ?? '')
						adapter.console.info(`\n${content}\n`)
					}
					nextVal = undefined
					break
				}
				default:
					nextVal = undefined
			}
		} catch (intentErr) {
			const e = /** @type {any} */ (intentErr)
			if (e instanceof CancelError || e?.message?.includes('cancel') || e?.message?.includes('Cancel')) {
				isThrowing = true
				throwError = intentErr
			} else {
				throw intentErr
			}
		}
	}
}
