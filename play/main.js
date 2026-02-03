#!/usr/bin/env node

import process from 'node:process'
import Logger from '@nan0web/log'
import { runBasicDemo } from './basic-demo.js'
import SelectDemo, { SelectBody, runSelectDemo } from './select-demo.js'
import { runUiCliDemo } from './ui-cli-demo.js'
import { runFormDemo } from './form-demo.js'
import CLiInputAdapter from '../src/InputAdapter.js'
import { runUiMessageDemo } from './ui-message-demo.js'
import { runTableDemo, runInstantTableDemo } from './table-demo.js'
import { runAutocompleteDemo } from './autocomplete-demo.js'
import { runLongListDemo } from './long-list-demo.js'
import { runAdvancedFormDemo } from './advanced-form-demo.js'
import { runSliderDemo } from './slider-demo.js'
import { runViewDemo } from './view-demo.js'
import { runNavDemo } from './nav-demo.js'
import { runTreeDemo } from './tree-demo.js'
import { runDateTimeDemo } from './datetime-demo.js'
import { CancelError } from '../src/index.js'
import getT, { localesMap } from './vocabs/index.js'

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
let inputAdapter = new CLiInputAdapter({ console })

/**
 * Current translation function.
 * @type {Function}
 */
let t = (key) => key

/**
 * Prompt user to choose a demo.
 *
 * @returns {Promise<string>} Selected demo value.
 * @throws {Error} If the user cancels the selection (error message contains "cancel").
 */
async function chooseDemo() {
	const demos = [
		{ name: t('Basic Logging Demo'), value: 'basic' },
		{ name: t('Select Prompt Demo'), value: 'select' },
		{ name: t('Simple UI‑CLI Demo'), value: 'ui-demo' },
		{ name: t('Form Input Demo'), value: 'form' },
		{ name: t('UiMessage Demo'), value: 'ui-message' },
		{ name: t('Table Filtering Demo'), value: 'table' },
		{ name: t('Table Filtering (Instant)'), value: 'table-instant' },
		{ name: t('Autocomplete Search Demo'), value: 'autocomplete' },
		{ name: t('Long List Scrolling Demo'), value: 'long-list' },
		{ name: t('Advanced Form Demo'), value: 'advanced-form' },
		{ name: t('Toggle Demo'), value: 'toggle' },
		{ name: t('Slider Demo'), value: 'slider' },
		{ name: t('ProgressBar Demo'), value: 'progress' },
		{ name: t('Spinner Demo'), value: 'spinner' },
		{ name: t('← Exit'), value: 'exit' },
	]

	// Pass the real logger as `console` so the menu is printed.
	const choice = await inputAdapter.requestSelect({
		title: t('Select UI‑CLI demo to run:'),

		options: demos.map((d) => d.name),
		limit: Math.max(5, (process.stdout.rows || 24) - 6),
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
async function showMenu(t) {
	console.info('\n' + '='.repeat(50))
	console.info(t('Demo completed. Returning to menu...'))
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

	// 1. Determine locale (env -> manual prompt)
	let locale = process.env.LANG?.split('_')[0] || process.env.LANGUAGE?.split(':')[0] || 'en'
	if (!localesMap.has(locale)) locale = 'en'

	// If we are not in automated test mode, we might want to ask for language
	if (!process.env.PLAY_DEMO_SEQUENCE) {
		const langChoice = await inputAdapter.requestSelect({
			title: 'Choose language / Виберіть мову:',
			options: Array.from(localesMap.values()),
			limit: Math.max(5, (process.stdout.rows || 24) - 6)
		})
		if (langChoice) {
			for (const [code, name] of localesMap.entries()) {
				if (name === langChoice) {
					locale = code
					break
				}
			}
		}
	}

	t = getT(locale)
	inputAdapter.t = t

	while (true) {
		try {
			const demos = [
				{ name: t('Basic Logging'), value: 'basic' },
				{ name: t('Select Prompt'), value: 'select' },
				{ name: t('Simple Demo'), value: 'ui-demo' },
				{ name: t('Form Input'), value: 'form' },
				{ name: t('UiMessage'), value: 'ui-message' },
				{ name: t('View Components'), value: 'view' },
				{ name: t('Nav Components'), value: 'nav' },
				{ name: t('Tree View'), value: 'tree' },
				{ name: t('Table Filtering'), value: 'table' },
				{ name: t('Instant Table'), value: 'table-instant' },
				{ name: t('Autocomplete'), value: 'autocomplete' },
				{ name: t('Long List'), value: 'long-list' },
				{ name: t('Advanced Form'), value: 'advanced-form' },
				{ name: t('Toggle'), value: 'toggle' },
				{ name: t('Slider'), value: 'slider' },
				{ name: t('ProgressBar'), value: 'progress' },
				{ name: t('Spinner'), value: 'spinner' },
				{ name: t('Date & Time'), value: 'datetime' },
				{ name: `← ${t('Exit')}`, value: 'exit' },
			]

			const selection = await inputAdapter.requestSelect({
				title: t('Select demo to run:'),
				options: demos.map((d) => d.name),
				limit: Math.max(5, (process.stdout.rows || 24) - 6),
				console, // ensure menu is visible in snapshots
			})


			const demoItem = demos.find((d) => d.name === selection)
			const demo = demoItem ? demoItem.value : 'exit'

			switch (demo) {
				case 'basic':
					await runBasicDemo(console, t)
					break
				case 'select':
					await runSelectDemo(console, inputAdapter, t)
					break
				case 'ui-demo':
					await runUiCliDemo(console, t)
					break
				case 'form':
					await runFormDemo(console, inputAdapter, t)
					break
				case 'ui-message':
					await runUiMessageDemo(console, inputAdapter, t)
					break
				case 'view':
					await runViewDemo(console, inputAdapter, t)
					break
				case 'nav':
					await runNavDemo(console, inputAdapter, t)
					break
				case 'tree':
					await runTreeDemo(console, inputAdapter, t)
					break
				case 'table':
					await runTableDemo(console, inputAdapter, t)
					break
				case 'table-instant':
					await runInstantTableDemo(console, inputAdapter, t)
					break
				case 'autocomplete':
					await runAutocompleteDemo(console, inputAdapter, t)
					break
				case 'long-list':
					await runLongListDemo(console, inputAdapter, t)
					break
				case 'advanced-form':
					await runAdvancedFormDemo(console, inputAdapter, t)
					break
				case 'toggle':
					await inputAdapter.requestToggle({
						message: t('Subscribe to newsletter'),
						initial: true,
						active: t('yes'),
						inactive: t('no')
					})
					break
				case 'slider':
					await runSliderDemo(console, inputAdapter, t)
					break
				case 'progress':
					{
						const bar = inputAdapter.requestProgress({ total: 100, title: t('ProgressBar Demo') })
						for (let i = 0; i <= 100; i++) {
							bar.update(i)
							await new Promise(r => setTimeout(r, 20))
						}
					}
					break
				case 'spinner':
					{
						const s = inputAdapter.requestSpinner(t('Spinner Demo'))
						const delay = process.env.PLAY_DEMO_SEQUENCE ? 60 : 3000
						await new Promise(r => setTimeout(r, delay))
						s.stop('✓')
					}
					break
				case 'datetime':
					await runDateTimeDemo(console, inputAdapter, t)
					break
				case 'exit':
					console.success(t('Thanks for exploring UI‑CLI demos! 🚀'))
					break
			}
			if (demo === 'exit') break
			await showMenu(t)
		} catch (error) {
			if (error instanceof CancelError || error.message?.includes('cancel') || error.message?.includes('Cancelled')) {
				console.info(Logger.style('\n' + t('Selection cancelled. Returning to menu...'), { color: Logger.DIM }))
				continue
			}
			// Don't exit on other errors, just log them and continue.
			// This prevents test failures when a demo throws (like validation error interpreted as crash).
			console.error(error)
			console.info(Logger.style('\n' + t('Error occurred. Returning to menu...'), { color: Logger.RED }))
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
