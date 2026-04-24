#!/usr/bin/env node

/**
 * Universal NaN•Web CLI Runner (Identity-Aware)
 */

import { bootstrapApp, App } from '../src/index.js'

bootstrapApp(App).catch((error) => {
	console.error(`[CRITICAL] Runtime Error: ${error.stack || error.message || error}`)
	process.exit(1)
})
