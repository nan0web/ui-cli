/**
 * Handles live preview mock rendering for UI components in CLI.
 */
export default class PreviewRenderer {
	/**
	 * @param {import('../InputAdapter.js').default} adapter
	 * @param {Object} data - The component model instance.
	 * @param {string} componentName - Name of the component.
	 */
	static async renderPreview(adapter, data, componentName) {
		adapter.console.info('\n' + '─'.repeat(40))
		adapter.console.info(`👀 Live Preview of <${componentName}>:`)
		adapter.console.info('─'.repeat(40))
		try {
			const intent = {
				type: 'ask',
				component: componentName,
				schema: { message: 'Preview' },
				model: data,
				options: data.options || ['a', 'b'],
			}
			// Provide mock options for tests or components that require them
			if (componentName === 'Autocomplete')
				intent.schema.options = ['Apple', 'Banana', 'Cherry']

			// Mock predefined input to bypass interactive prompts automatically for the preview
			const originAsk = adapter.ask
			adapter.ask = async () => ({ value: null, cancelled: true })
			
			// Setting a flag to disable pre-defined answers during preview
			adapter._disableNextAnswerLookup = true

			// Simulate an aborted signal so `prompts` doesn't hang
			globalThis.__IS_SANDBOX_PREVIEW__ = true
			const previewPromise = adapter.askIntent(intent)

			// We still want to timeout just in case it's a completely custom blocking component
			// Also checking adapter properties since stop() is often generic
			setTimeout(() => {
				if (typeof adapter.stop === 'function') adapter.stop()
			}, 100)

			try {
				await previewPromise
			} catch (e) {
				const errStr = String(e)
				const errObj = /** @type {any} */ (e)
				if (
					errStr.includes('Unsupported intent component mapping in CLI') ||
					(errObj && errObj.fields && errObj.fields.unhandled_intent) ||
					(errObj && errObj.message && errObj.message.includes('unhandled_intent'))
				) {
					if (componentName === 'Button') {
						PreviewRenderer.#mockButtonRender(adapter, data, componentName)
					} else {
						const variant = data.variant ? `${data.variant} ` : ''
						const content = data.content || data.title || data.label || componentName
						const disabled = data.disabled ? ' (disabled)' : ''
						adapter.console.info(`[ ${variant}${content}${disabled} ]`)
					}
				} else {
					adapter.console.warn(`[Preview not available yet: ${String(e)}]`)
				}
			}

			adapter.ask = originAsk
			adapter._disableNextAnswerLookup = false
			globalThis.__IS_SANDBOX_PREVIEW__ = false
		} catch (e) {
			adapter.console.warn(`[Preview wrapper failed: ${String(e)}]`)
		}
		adapter.console.info('─'.repeat(40) + '\n')
	}

	static #mockButtonRender(adapter, data, componentName) {
		// ANSI escape codes
		const R = '\x1b[0m'  // reset
		const B = '\x1b[1m'  // bold
		const D = '\x1b[2m'  // dim
		const U = '\x1b[4m'  // underline
		
		// Color maps matching ButtonModel variants
		const bgMap = {
			primary:   '\x1b[44m\x1b[97m',  // bgBlue, brightWhite
			secondary: '\x1b[100m\x1b[97m', // bgBrightBlack(gray), brightWhite
			info:      '\x1b[46m\x1b[30m',  // bgCyan, fgBlack
			ok:        '\x1b[42m\x1b[30m',  // bgGreen, fgBlack
			warn:      '\x1b[43m\x1b[30m',  // bgYellow, fgBlack
			err:       '\x1b[41m\x1b[97m',  // bgRed, brightWhite
			ghost:     '\x1b[2m',           // dim only (transparent)
		}
		const fgMap = {
			primary:   '\x1b[34m',  // fgBlue
			secondary: '\x1b[90m',  // fgBrightBlack(gray)
			info:      '\x1b[36m',  // fgCyan
			ok:        '\x1b[32m',  // fgGreen
			warn:      '\x1b[33m',  // fgYellow
			err:       '\x1b[31m',  // fgRed
			ghost:     '\x1b[2m',   // dim
		}
		
		const v = data.variant || 'primary'
		const sz = data.size || 'md'
		const isOutline = data.outline || false
		const isDisabled = data.disabled || false
		const isLoading = data.loading || false
		const text = data.content || data.title || data.label || 'Button'
		
		// Size-based styling
		const pad = sz === 'sm' ? '' : sz === 'lg' ? '  ' : ' '
		const sizeStyle = sz === 'lg' ? B : sz === 'sm' ? '' : ''
		
		const colorCode = isOutline ? (fgMap[v] || fgMap.primary) : (bgMap[v] || bgMap.primary)
		const innerDim = isDisabled ? D : ''
		const resetDim = isDisabled ? '\x1b[22m' : '' // reset dim logic, leave colors
		
		if (isLoading && !isDisabled) {
			adapter.console.info(`${colorCode}${sizeStyle}[${pad}⟲ loading...${pad}]${R}`)
		} else {
			const label = isDisabled ? `${text} ✗` : text
			adapter.console.info(`${colorCode}${sizeStyle}[${pad}${innerDim}${label}${resetDim}${pad}]${R}`)
		}
	}
}
