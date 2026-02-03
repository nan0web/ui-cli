/**
 * OutputAdapter handles UI output operations in command-line environment.
 * @class
 */
export default class OutputAdapter {
	/** @type {any} */
	#console
	/** @type {Map<string, () => Promise<Function>>} */
	#components = new Map()

	/**
	 * Creates new output adapter.
	 * @param {Object} [options] - Configuration options.
	 * @param {any} [options.console] - Console implementation.
	 * @param {Map<string, () => Promise<Function>>} [options.components] - Component loaders.
	 */
	constructor(options = {}) {
		const { console: initialConsole = console, components = new Map() } = options

		this.#console = initialConsole
		this.#components = components
	}

	/** @returns {any} */
	get console() {
		return this.#console
	}

	/**
	 * Render a UI component in the CLI environment.
	 *
	 * The current implementation supports simple textual rendering.
	 *
	 * @param {string} component - Component name (e.g. `"Alert"`).
	 * @param {object} props - Props object passed to the component.
	 * @returns {Promise<void>}
	 */
	async render(component, props) {
		const loader = this.#components.get(component)
		if (loader) {
			try {
				const compFn = await loader()
				if (typeof compFn === 'function') {
					compFn.call(this, props)
					return
				}
			} catch (/** @type {any} */ err) {
				this.#console.error(`Failed to render component "${component}": ${err.message}`)
				this.#console.debug?.(err.stack)
			}
		}
		if (props && typeof props === 'object') {
			const { variant, content } = props
			const prefix = variant ? `[${variant}]` : ''
			this.#console.info(`${prefix} ${String(content)}`)
		} else {
			this.#console.info(String(component))
		}
	}
}
