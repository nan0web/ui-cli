#!/usr/bin/env node

/**
 * nan0cli runner demo – shows how an external app
 * would use nan0cli as its CLI entry point.
 *
 * Usage:
 *   node play/nan0cli-demo.js serve
 *   node play/nan0cli-demo.js dump
 *   node play/nan0cli-demo.js help
 */

import { CLI, Alert, render } from '../src/index.js'
import Logger from '@nan0web/log'

const console = new Logger({ level: 'info' })
console.clear()
console.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))
console.info('')
console.info(Logger.style('  nan0cli Runner Demo', { color: Logger.CYAN, bold: true }))
console.info(Logger.style('  ───────────────────', { color: Logger.DIM }))
console.info('')

// ─── 1. Define commands directly (lightweight approach) ───

const commands = {
	async *serve() {
		const port = 3033
		console.success(`🚀 Starting server on port ${port}`)

		const alert = new Alert({
			type: 'info',
			title: 'Server Config',
			description: `Port: ${port}\nSSL: disabled\nDebug: false`,
		})
		const output = render(alert)
		console.info(typeof output === 'string' ? output : await output)
	},

	async *dump() {
		const dist = './dist'
		console.success(`📦 Dumping build to ${dist}`)

		const alert = new Alert({
			type: 'success',
			title: 'Build Complete',
			description: `Output: ${dist}`,
		})
		const output = render(alert)
		console.info(typeof output === 'string' ? output : await output)
	},
}

// ─── 2. Create CLI with commands map ───

const cli = new CLI({
	commands,
	argv: process.argv.slice(2),
})

// ─── 3. Run ───

;(async () => {
	try {
		for await (const output of cli.run()) {
			if (output?.content) {
				output.content.forEach((line) => console.info(line))
			}
		}
	} catch (error) {
		const alert = new Alert({
			type: 'error',
			title: 'Runtime Error',
			description: error.message,
		})
		const out = render(alert)
		console.info(typeof out === 'string' ? out : await out)
		process.exit(1)
	}
})()
