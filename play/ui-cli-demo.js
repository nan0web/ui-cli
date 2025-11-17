/**
 * Simple UI‑CLI demo – shows how to compose command bodies
 * and print ready‑to‑use messages.
 *
 * @module play/ui-cli-demo
 */

import Logger from "@nan0web/log"
import { ServeBody } from "./examples/serveBody.js"
import { DumpBody } from "./examples/dumpBody.js"
import { serveMessage, dumpMessage } from "./examples/messages.js"

/**
 * Run the demo.
 *
 * @param {Logger} console - Logger instance.
 */
export async function runUiCliDemo(console) {
	console.clear()
	console.success("Simple UI‑CLI Demo")

	console.info(serveMessage(ServeBody))
	console.info(dumpMessage(DumpBody))
}