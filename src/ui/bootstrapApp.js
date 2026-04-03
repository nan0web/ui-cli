import os from 'node:os'
import path from 'node:path'
import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { modelFromArgv } from './core/modelFromArgv.js'
import CLiInputAdapter from './core/InputAdapter.js'
import { runGenerator } from './core/GeneratorRunner.js'


/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 * 
 * It automatically handles:
 * 1. DB Mounting (Sovereign Local + Home ~/ namespaces)
 * 2. i18n Initialization (Sovereign i18n Protocol)
 * 3. Argument Parsing (Model-as-Schema)
 * 4. Generator Execution Loop (runGenerator)
 * 5. Process Exit Lifecycle
 */
export async function bootstrapApp(AppModel, config = {}) {
	const argv = config.argv || process.argv.slice(2)
	const isDebug = process.argv.includes('--debug') || process.argv.includes('-d')
	
	const console = new Logger({ level: Logger.detectLevel(process.argv) })
	const dbConsole = new Logger({ level: isDebug ? 'debug' : 'error' })
	
	const db = new DB({ console: /** @type {any} */ (dbConsole) })
	const fs = new DBFS({ console: /** @type {any} */ (dbConsole) })

	// 1. Identify application from package.json
	const pkg = await fs.loadDocument('package.json', {})
	const appName = pkg.name ? pkg.name.replace(/^@nan0web\//, '') : 'app'

	// 2. Setup standard NaN0Web mounts
	db.mount('', new DBFS({ root: config.root || 'data', console: /** @type {any} */ (dbConsole) }))
	
	const mockHome = process.env.UI_SNAPSHOT || process.env.NODE_ENV === 'test'
	const homeDb = new DBFS({ 
		cwd: mockHome ? process.cwd() : os.homedir(), 
		root: mockHome ? path.resolve(process.cwd(), '.test_home') : `.${appName}`,
		console: /** @type {any} */ (dbConsole)
	})
	db.mount('~', homeDb)
	
	await db.connect()
	db.seal()

	// 3. I18n setup (Agnostic dynamic loading)
	let t = config.t
	if (!t) {
		const lang = process.env.LANG ? process.env.LANG.split('_')[0].split('-')[0] : 'uk'
		const { I18nDb } = await import('@nan0web/i18n')
		const i18nDb = new I18nDb({ db, locale: lang, tPath: '_/t.yaml', dataDir: '' })
		t = await i18nDb.createT(lang)
	}

	// 4. Parse arguments and instantiate model (Model-as-Schema)
	const appOptions = { db, logger: console, t, ...config }
	const model = modelFromArgv(AppModel, argv, appOptions)

	const adapter = new CLiInputAdapter({ console, t })
	
	try {
		const res = await runGenerator(model, adapter, appOptions)
		process.exit(res.success && !res.cancelled && res.data?.status !== 'error' ? 0 : 1)
	} catch (err) {
		const error = /** @type {any} */ (err)
		console.error(String(error.stack || error.message || error))
		process.exit(1)
	}
}

