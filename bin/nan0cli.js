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
import path from 'node:path'
import os from 'node:os'

import DBFS from '@nan0web/db-fs'
import DB from '@nan0web/db'
import Logger from '@nan0web/log'

import { CLI, Alert, render, runApp, runGenerator, CLiInputAdapter } from '../src/index.js'

const console = new Logger({ level: Logger.detectLevel(process.argv) })
const fs = new DBFS()

const isDebug = process.argv.includes('--debug') || process.argv.includes('-d')
const dbConsole = new Logger({ level: isDebug ? 'debug' : 'error' })

const db = new DB({ console: dbConsole })
db.mount('', new DBFS({ root: 'data', console: dbConsole })) // Application Config & Translations
/**
 * Display error via Alert component + Logger
 * @param {string} title
 * @param {string|Error} textOrError
 */
const showError = async (title, textOrError) => {
	const text = textOrError instanceof Error
		? (textOrError.stack || textOrError.message || String(textOrError))
		: (textOrError || 'Unknown error')
	try {
		console.error(await render(new Alert({ variant: 'error', title, message: text })))
	} catch {
		console.error(`[CRITICAL] ${title}: ${text}`)
	}
}

	;(async () => {
	try {
		// 1. OLMUI Thin Client (Remote Execution mode)
		const targetUrl = process.argv[2];
		if (targetUrl && /^https?:\/\//.test(targetUrl)) {
			console.info(`🌍 Connecting to Remote OLMUI Server at ${targetUrl}...`);
			const lang = process.env.LANG ? process.env.LANG.split('_')[0].split('-')[0] : 'uk';
			// Sovereign i18n (A4): Load dictionary from YAML files in data/
			const baseT = await db.loadDocument('_/t.yaml', {})
			const localeT = (lang !== 'en') ? await db.loadDocument(`${lang}/_/t.yaml`, {}) : {}
			const vocab = { ...baseT, ...localeT }
			const { createT } = await import('@nan0web/types')
			const t = createT(vocab)

			const adapter = new CLiInputAdapter({ console, t });
			let currentSessionId = null;
			let answerToSend = undefined;

			while (true) {
				const res = await fetch(targetUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentSessionId ? { sessionId: currentSessionId, answer: answerToSend } : {})
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err.error || `HTTP ${res.status}`);
				}

				const { sessionId, intent, done } = await res.json();
				currentSessionId = sessionId;
				const currentIntent = intent.value || intent;

				// 1. Process Results or Progress
				if (currentIntent && currentIntent.type === 'progress') {
					console.info(`⏳ ${currentIntent.message || 'Progress...'}`);
					answerToSend = undefined;
					if (done) break;
					continue;
				}

				if (currentIntent && currentIntent.type === 'result') {
					const data = currentIntent.data || currentIntent;
					const isSuccess = data.success !== false;
					const icon = isSuccess ? '✅' : '❌';
					
					console.info(`\n${icon} ${isSuccess ? 'SUCCESS' : 'ERROR'}`);
					
					if (data.message) {
						console.info(`\n   ${t(data.message)}`);
					}
					
					const details = { ...data };
					delete details.type;
					delete details.success;
					delete details.message;
					
					if (Object.keys(details).length > 0) {
						console.info(`\n   Details:\n`, JSON.stringify(details, null, 2).split('\n').map(l => `   ${l}`).join('\n'));
					}

					answerToSend = undefined;
					if (done) break;
					continue;
				}

				if (done) break;

				// Using IntentDispatcher inside adapter to render remote intents
				const adapterRes = await adapter.dispatcher.askIntent(currentIntent);
				if (adapterRes.cancelled) {
					console.info('\nCancelled by user');
					return process.exit(0);
				}
				
				answerToSend = adapterRes;
			}
			console.info(`\n✅ Session Finished`);
			return;
		}

		// 2. Load package.json via DBFS (A4)
		const pkg = await fs.loadDocument('package.json', {})
		const appName = pkg.name ? pkg.name.replace(/^@nan0web\//, '') : 'app'
		
		// Mount Home DB to '~' inside the root 'db'
		// Fallback: if DBFS fails (no write access), MemoryDB keeps session alive (Сірко)
		const mockHome = process.env.UI_SNAPSHOT || process.env.NODE_ENV === 'test'
		const homeDb = new DBFS({ 
			cwd: mockHome ? process.cwd() : os.homedir(), 
			root: mockHome ? path.resolve(process.cwd(), '.test_home') : `.${appName}`,
			console: dbConsole
		})
		const memoryFallback = new DB({ console: dbConsole })
		await memoryFallback.connect()
		homeDb.attach(memoryFallback)
		
		db.mount('~', homeDb)
		await homeDb.connect()
		
		// Mount Private DB to '@private' with Authorization Driver (Макіавеллі + Сократ)
		const tmpDir = (await import('node:fs')).mkdtempSync((await import('node:path')).join(os.tmpdir(), 'grow-private-'))
		;(await import('node:fs')).writeFileSync((await import('node:path')).join(tmpDir, 'farm_stats.json'), JSON.stringify({ income: 42000 }))
		
		const privateDb = new DBFS({ 
			root: tmpDir,
			console: db.console
		})
		class AuthDriver extends DB.Driver {
			async access(uri, level, context) {
				// Only 'admin' role has access to @private
				if (context?.role === 'admin') return true
				return false
			}
		}
		privateDb.driver = new AuthDriver()
		await privateDb.connect()
		db.mount('@private', privateDb)
		
		// Wait for root DB and connections — ensure mounts are ready
		await db.connect()
		
		// Seal mount registry — no further mount/unmount allowed (Макіавеллі)
		db.seal()
		
		// Wire driver-level progress events to CLI adapter (Пелевін)
		db.on('progress', (event) => {
			console.info(event.message || `Loading ${event.uri}...`)
		})
		
		// 2. OLMUI v2: App-as-a-Model entry
		const uiCliExport = pkg?.exports?.['./ui/cli']
		let appPath = null;

		if (process.argv[2] === 'blueprint') {
			appPath = new URL('../src/blueprint/project.js', import.meta.url).pathname
		} else if (uiCliExport) {
			const exportPath = typeof uiCliExport === 'string' ? uiCliExport : (uiCliExport.import || uiCliExport.default)
			if (exportPath) {
				appPath = fs.absolute(exportPath)
			}
		}

		if (appPath) {
			const appModule = await import(pathToFileURL(appPath))
			const AppModel = appModule.default || appModule.App || Object.values(appModule).find(m => typeof m === 'function' && m.prototype?.run)
				
			if (!AppModel) {
				showError('Config Error', `Module at ${appPath} (from exports['./ui/cli'] or blueprint) must export default, App class, or a class with run()`)
				process.exit(1)
			}
				
				const lang = process.env.LANG ? process.env.LANG.split('_')[0].split('-')[0] : 'uk';
				const targetLocalUrl = (targetUrl && !/^https?:\/\//.test(targetUrl)) ? targetUrl : undefined;
				// Extract locale from URL path: /uk/order → uk, /en/restore_pin → en
				const urlLocale = targetLocalUrl?.match(/^\/([a-z]{2})(\/|$)/)?.[1]
				const effectiveLang = urlLocale || lang
				const { I18nDb } = await import('@nan0web/i18n')
				const i18nDb = new I18nDb({ db, locale: effectiveLang, tPath: '_/t.yaml', dataDir: '' })
				const t = await i18nDb.createT(effectiveLang)
				
				if (process.env.UI_SNAPSHOT) {
					// Interleave stderr with stdout for correct sequence in snapshots
					const originalError = console.error
					console.error = (...args) => console.info(...args)
				}
				
				const adapter = new CLiInputAdapter({ console, t })
				const options = { db, locale: effectiveLang, t, targetUrl: targetLocalUrl }
				
				// App-as-a-Model: if class has run() generator, drive it directly
				if (AppModel.prototype && typeof AppModel.prototype.run === 'function') {
					let app = new AppModel({}, options)
					while (true) {
						const res = await runGenerator(app, adapter, options)
						if (res.cancelled) {
							adapter.console.info('')
							break
						}

						if (res.data?.type === 'result' && res.data?.data?.action === 'set_locale') {
							const newLang = res.data.data.locale;
							const i18nDbReload = new I18nDb({ db, locale: newLang, tPath: '_/t.yaml', dataDir: '' })
							const newT = await i18nDbReload.createT(newLang)

							adapter.t = newT
							options.t = newT
							options.locale = newLang
							options.t = newT
							if (res.data.data.url) options.targetUrl = res.data.data.url
							app = new AppModel({}, options)
							continue
						}

						if (res.data?.type === 'result') {
							if (typeof adapter.resultIntent === 'function') {
								await adapter.resultIntent(res.data)
							}
						}
						break
					}
				} else {
					await runApp(AppModel, adapter, options)
				}
				process.exit(0)
		}

		// 3. Legacy: Resolve entry point via statDocument (B3)
		const entry = pkg?.nan0web?.cli?.entry
		const candidates = [entry, 'src/cli.js', 'src/messages/index.js'].filter(Boolean)
		appPath = null

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
		showError('Runtime Error', error)
		process.exit(1)
	}
})()
