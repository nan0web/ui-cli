#!/usr/bin/env node

import process from "node:process"
import Logger from "@nan0web/log"
import { runBasicDemo } from "./basic-demo.js"
import SelectDemo, { SelectBody, runSelectDemo } from "./select-demo.js"
import { runUiCliDemo } from "./ui-cli-demo.js"
import { runFormDemo } from "./form-demo.js"
import CLIInputAdapter from "../src/InputAdapter.js"

/**
 * UI‑CLI playground – runs a series of demo scripts.
 *
 * Use env PLAY_DEMO_SEQUENCE to automate choices, e.g.
 * PLAY_DEMO_SEQUENCE=1,4 node play/main.js
 *
 * The same {@link CLIInputAdapter} instance is used for all prompts;
 * it consumes predefined answers in order.
 */
const console = new Logger({ level: "info" })
console.clear()
console.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

const commands = [
	// BasicDemo,
	SelectDemo,
	// CLiDemo,
	// ExitDemo,
]

// Shared adapter – reads PLAY_DEMO_SEQUENCE internally.
const inputAdapter = new CLIInputAdapter()

/**
 * Prompt user to choose a demo.
 *
 * @returns {Promise<string>} Selected demo value.
 * @throws {Error} If the user cancels the selection (error message contains "cancel").
 */
async function chooseDemo() {
	const demos = [
		{ name: "Basic Logging Demo",     value: "basic" },
		{ name: "Select Prompt Demo",     value: "select" },
		{ name: "Simple UI‑CLI Demo",     value: "ui-demo" },
		{ name: "Form Input Demo",        value: "form" },  // New form demo
		{ name: "← Exit",                 value: "exit" },
	]

	// Pass the real logger as `console` so the menu is printed.
	const choice = await inputAdapter.requestSelect({
		title: "Select UI‑CLI demo to run:",
		prompt: "[demo]: ",
		options: demos.map(d => d.name),
		console,               // <-- ensure the menu is displayed
	})

	// Convert the selected name to its internal value or throw a cancel error.
	const found = demos.find(d => d.name === choice)

	if (!found) {
		// Throw an error that the outer catch recognises as a cancellation.
		throw new Error("cancel")
	}

	return found.value
}

/**
 * Visual separation after each demo.
 */
async function showMenu() {
	console.info("\n" + "=".repeat(50))
	console.info("Demo completed. Returning to menu...")
	console.info("=".repeat(50) + "\n")
}

/**
 * Main loop.
 */
async function main() {
	while (true) {
		try {
			const demo = await chooseDemo()

			switch (demo) {
				case "basic":
					await runBasicDemo(console)
					break
				case "select":
					await runSelectDemo(console, inputAdapter)
					break
				case "ui-demo":
					await runUiCliDemo(console)
					break
				case "form":
					await runFormDemo(console, inputAdapter)  // New form demo
					break
				case "exit":
					console.success("Thanks for exploring UI‑CLI demos! 🚀")
					process.exit(0)
			}
			await showMenu()
		} catch (error) {
			if (error.message?.includes("cancel")) {
				// Use `info` (stdout) without a leading newline to match test expectations.
				console.info("Demo cancelled. Returning to menu...")
				await showMenu()
				continue
			}
			console.error(error)
			process.exit(1)
		}
	}
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
