import CLIInputAdapter from './InputAdapter.js'
import { select, next, pause, createInput, ask, Input } from './ui/index.js'
import { CancelError } from '@nan0web/ui/core'
import CLI from './CLI.js'

// Export CLI input adapter
export {
	CLI,
	CLIInputAdapter,
	CancelError,
	createInput,
	ask,
	Input,
	select,
	next,
	pause,
}

// Export renderers for CLI components
export const renderers = new Map([
	['UIProcess', (data) => {
		// Render process information in CLI
		return `${data.title || 'Process'}: ${data.status || 'running'}`
	}],
])

export default CLIInputAdapter
