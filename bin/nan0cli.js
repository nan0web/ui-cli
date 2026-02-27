#!/usr/bin/env node

/**
 * Universal NaN•Web CLI Runner
 *
 * Takes configuration from current working directory's package.json
 * and executes command using @nan0web/ui-cli core logic.
 *
 * App contract:
 *   E1: export default [Serve, Dump]      — Messages Array
 *   E2: export default class MyApp { }    — Single Message class (auto-wrapped)
 */

import { pathToFileURL } from 'node:url'

import DBFS from '@nan0web/db-fs'
import Logger from '@nan0web/log'

import { CLI, Alert, render } from '../src/index.js'

const console = new Logger({ level: Logger.detectLevel(process.argv) })
const fs = new DBFS()

/**
 * Display error via Alert component + Logger
 * @param {string} title
 * @param {string} text
 */
const showError = async (title, text) => {
	try {
		console.error(await render(new Alert({ type: 'error', title, description: text })))
	} catch {
		console.error(`[CRITICAL] ${title}: ${text}`)
	}
}

;(async () => {
	try {
		// 1. Load package.json via DBFS (A4)
		const pkg = await fs.loadDocument('package.json', {})
		const entry = pkg?.nan0web?.cli?.entry

		// 2. Resolve entry point via statDocument (B3)
		const candidates = [entry, 'src/cli.js', 'src/messages/index.js'].filter(Boolean)
		let appPath = null

		for (const candidate of candidates) {
			const stat = await fs.statDocument(candidate)
			if (!stat.error) {
				appPath = fs.absolute(candidate)
				break
			}
		}

		if (!appPath) {
			showError(
				'Config Error',
				'No CLI entry point found.\nPlease add "nan0web.cli.entry" to package.json\nOR create src/cli.js / src/messages/index.js'
			)
			process.exit(1)
		}

		// 3. Import App Module (D1)
		const appModule = await import(pathToFileURL(appPath))

		// 4. Resolve Messages (E1 + E2)
		const App = appModule.default || appModule.Messages || appModule.App
		if (!App) {
			showError('Config Error', `Module at ${appPath} must export default, Messages, or App`)
			process.exit(1)
		}
		const Messages = Array.isArray(App) ? App : [App]

		// 5. Run CLI
		const cli = new CLI({ Messages, argv: process.argv.slice(2) })
		for await (const output of cli.run()) {
			if (output?.content) {
				output.content.forEach((line) => console.info(line))
			}
		}
	} catch (error) {
		showError('Runtime Error', error.message || String(error))
		if (process.env.DEBUG) console.error(error.stack)
		process.exit(1)
	}
})()
