#!/usr/bin/env node

/**
 * NaN•Web CLI v2 — Model-as-App entry point.
 *
 * Delegates all routing logic to `App extends Model`.
 * Bootstrap handles: DB, i18n, argv parsing, process.exit.
 */

import { bootstrapApp } from '../src/ui/bootstrapApp.js'
import App from '../src/domain/App.js'

bootstrapApp(App, {
	// Pass remaining args to App (skip the node binary + this script)
	argv: process.argv.slice(2),
})
