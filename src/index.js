import { CancelError } from '@nan0web/ui/core'

import CLiInputAdapter from './InputAdapter.js'
import OutputAdapter from './OutputAdapter.js'
import CLI from './CLI.js'
import Command from './Command.js'
import CommandError from './CommandError.js'
import CommandMessage from './CommandMessage.js'
import CommandParser from './CommandParser.js'
import CommandHelp from './CommandHelp.js'
export { str2argv } from './utils/parse.js'

// Export ALL UI components
export {
	select, next, pause, createInput, ask, Input, text, confirm, autocomplete,
	table, badge, alert, toast, breadcrumbs, tabs, steps,
	spinner, Spinner,
	progress, ProgressBar,
	tree,
	slider,
	toggle,
	mask,
	multiselect,
	datetime
} from './ui/index.js'

/** @typedef {import("./CommandHelp.js").CommandHelpField} CommandHelpField */

export {
	CLI,
	CLiInputAdapter,
	CancelError,
	OutputAdapter,

	/** @deprecated */
	Command,
	/** @deprecated */
	CommandError,
	/** @deprecated */
	CommandMessage,
	CommandParser,
	CommandHelp,
}

/* New public API */
export { default as Form, generateForm } from './ui/form.js'

export const renderers = new Map([
	[
		'UIProcess',
		(data) => {
			return `${data.title || 'Process'}: ${data.status || 'running'}`
		},
	],
])

export default CLiInputAdapter
