import CLIInputAdapter from "./InputAdapter.js"
import { CancelError } from "@nan0web/ui/core"
import CLI from "./CLI.js"
import Command from "./Command.js"
import CommandError from "./CommandError.js"
import CommandMessage from "./CommandMessage.js"
import CommandParser from "./CommandParser.js"
import CommandHelp from "./CommandHelp.js"
export { str2argv } from "./utils/parse.js"

export {
	select,
	next,
	pause,
	createInput,
	ask,
	Input,
} from "./ui/index.js"

/** @typedef {import("./CommandHelp.js").CommandHelpField} CommandHelpField */

export {
	CLI,
	CLIInputAdapter,
	CancelError,

	/** @deprecated */
	Command,
	/** @deprecated */
	CommandError,
	/** @deprecated */
	CommandMessage,

	CommandParser,
	CommandHelp,
}

export const renderers = new Map([
	[
		"UIProcess",
		data => {
			return `${data.title || "Process"}: ${data.status || "running"}`
		},
	],
])

export default CLIInputAdapter
