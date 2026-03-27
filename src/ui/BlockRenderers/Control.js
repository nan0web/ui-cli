/**
 * Universal Documentation Blocks - Control Fallbacks for CLI
 */

export const Control = {
	ThemeToggle: (props) => {
		const { console } = props
		if (console) {
			console.info('[CONTROL] ThemeToggle (Ignored in CLI UI)')
		}
	},
}

export default Control
