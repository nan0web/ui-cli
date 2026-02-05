/**
 * Component Renderer.
 *
 * Handles both Static Views and Interactive Prompts.
 */

export async function render(component) {
	// 1. Resolve Promises (if component is constructed async)
	if (component instanceof Promise) {
		component = await component
	}

	// 2. Handle null/undefined
	if (!component) return

	// 3. Handle Interactive Prompts (Active)
	if (typeof component.execute === 'function') {
		const result = await component.execute()
		// If result is the unified return contract { value, cancelled }, unwrap it
		if (result && typeof result === 'object' && 'value' in result) {
			return result.value
		}
		return result
	}

	// 4. Handle Static Views (Passive)
	// If it has a specific toString implementation (which our Views do), use it.
	// Or if it's just a string.
	const output = String(component)

	// We append a newline for better UX in terminals, unless it's empty
	if (output) {
		process.stdout.write(output + '\n')
	}

	return output
}
