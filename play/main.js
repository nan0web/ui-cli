#!/usr/bin/env node

import process from 'node:process'
import Logger from '@nan0web/log'
import { runBasicDemo } from './basic-demo.js'
import SelectDemo, { SelectBody, runSelectDemo } from './select-demo.js'
import { runUiCliDemo } from './ui-cli-demo.js'
import { runFormDemo } from './form-demo.js'
import CLIInputAdapter from '../src/InputAdapter.js'
import { runUiMessageDemo } from './ui-message-demo.js'
import { runTableDemo, runInstantTableDemo } from './table-demo.js'
import { runAutocompleteDemo } from './autocomplete-demo.js'
import { runLongListDemo } from './long-list-demo.js'
import { runAdvancedFormDemo } from './advanced-form-demo.js'
import { CancelError } from '../src/index.js'

/**
 * UI‑CLI playground – runs a series of demo scripts.
 *
 * Use env PLAY_DEMO_SEQUENCE to automate choices, e.g.
 * PLAY_DEMO_SEQUENCE=1,4 node play/main.js
 *
 * The same {@link CLIInputAdapter} instance is used for all prompts;
 * it consumes predefined answers in order.
 */
const console = new Logger({ level: 'info' })
console.clear()
console.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

const commands = [
	// BasicDemo,
	SelectDemo,
	// CLiDemo,
	// ExitDemo,
]

/**
 * Shared adapter – reads PLAY_DEMO_SEQUENCE internally.
 */
const inputAdapter = new CLIInputAdapter({ console })

/**
 * Prompt user to choose a demo.
 *
 * @returns {Promise<string>} Selected demo value.
 * @throws {Error} If the user cancels the selection (error message contains "cancel").
 */
async function chooseDemo() {
	const demos = [
		{ name: 'Basic Logging Demo', value: 'basic' },
		{ name: 'Select Prompt Demo', value: 'select' },
		{ name: 'Simple UI‑CLI Demo', value: 'ui-demo' },
		{ name: 'Form Input Demo', value: 'form' },
		{ name: 'UiMessage Demo', value: 'ui-message' },
		{ name: 'Table Filtering Demo', value: 'table' },
		{ name: 'Table Filtering (Instant)', value: 'table-instant' },
		{ name: 'Autocomplete Search Demo', value: 'autocomplete' },
		{ name: 'Long List Scrolling Demo', value: 'long-list' },
		{ name: 'Advanced Form Demo', value: 'advanced-form' },
		{ name: '← Exit', value: 'exit' },
	]

	// Pass the real logger as `console` so the menu is printed.
	const choice = await inputAdapter.requestSelect({
		title: 'Select UI‑CLI demo to run:',
		prompt: '[demo]: ',
		options: demos.map((d) => d.name),
		console, // <-- ensure the menu is displayed
	})

	// Convert the selected name to its internal value or handle cancel.
	if (!choice) return 'exit' // Escape or Ctrl+C in menu = exit

	const found = demos.find((d) => d.name === choice)
	return found ? found.value : 'exit'
}

/**
 * Visual separation after each demo.
 */
async function showMenu() {
	console.info('\n' + '='.repeat(50))
	console.info('Demo completed. Returning to menu...')
	console.info('='.repeat(50) + '\n')
}

/**
 * Main loop.
 */
async function main() {
	// Global Ctrl+C handler for immediate exit
	process.on('SIGINT', () => {
		console.info('\n' + Logger.style('Interrupted by user (Ctrl+C)', { color: Logger.YELLOW }))
		process.exit(0)
	})

	while (true) {
		try {
			const demo = await chooseDemo()

			switch (demo) {
				case 'basic':
					await runBasicDemo(console)
					break
				case 'select':
					await runSelectDemo(console, inputAdapter)
					break
				case 'ui-demo':
					await runUiCliDemo(console)
					break
				case 'form':
					await runFormDemo(console, inputAdapter)
					break
				case 'ui-message':
					await runUiMessageDemo(console, inputAdapter)
					break
				case 'table':
					await runTableDemo(console, inputAdapter)
					break
				case 'table-instant':
					await runInstantTableDemo(console, inputAdapter)
					break
				case 'autocomplete':
					await runAutocompleteDemo(console, inputAdapter)
					break
				case 'long-list':
					await runLongListDemo(console, inputAdapter)
					break
				case 'advanced-form':
					await runAdvancedFormDemo(console, inputAdapter)
					break
				case 'exit':
					console.success('Thanks for exploring UI‑CLI demos! 🚀')
					process.exit(0)
			}
			await showMenu()
		} catch (error) {
			if (error instanceof CancelError || error.message?.includes('cancel')) {
				console.info(Logger.style('\nSelection cancelled. Returning to menu...', { color: Logger.DIM }))
				continue
			}
			console.error(error)
			process.exit(1)
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
