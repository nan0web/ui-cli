import os from 'node:os'
import process from 'node:process'
import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { modelFromArgv } from './core/modelFromArgv.js'
import CLiInputAdapter from './core/InputAdapter.js'
import { runGenerator } from './core/GeneratorRunner.js'

/**
 * @typedef {Object} BootstrapAppConfig
 * @property {string[]} [argv=process.argv.slice(2)] Arguments of the console app.
 * @property {DB} [db] Root database with mounted all required databases already.
 * @property {object} [env={}] Environment variables.
 * @property {() => string} [cwd=process.cwd] Current working directory function.
 * @property {import('@nan0web/i18n').TFunction} [t] Translation function.
 * @property {boolean} [noExit=false] Provides a result instead of exit when true.
 * @property {string} [root] Optional DB mount root path.
 */

/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 *
 * It automatically handles:
 * 1. DB Mounting (Sovereign Local + Home ~/ namespaces)
 * 2. i18n Initialization (Sovereign i18n Protocol)
 * 3. Argument Parsing (Model-as-Schema)
 * 4. Generator Execution Loop (runGenerator)
 * 5. Process Exit Lifecycle
 * @param {typeof import('@nan0web/types').Model} AppModel
 * @param {BootstrapAppConfig} [config={}]
 */
export async function bootstrapApp(AppModel, config = {}) {
	const argv = config.argv ?? process.argv.slice(2)
	const env = config.env ?? process.env
	const cwd = config.cwd ?? process.cwd
	const isDebug = argv.includes('--debug')

	const console = new Logger({ level: Logger.detectLevel(argv) })
	const dbConsole = new Logger({ level: isDebug ? 'debug' : 'error' })

	const db = config.db || new DB({ console: /** @type {any} */ (dbConsole) })
	const fs = new DBFS({ console: /** @type {any} */ (dbConsole) })

	// 1. Identify application from package.json
	const pkg = await fs.loadDocument('package.json', {})
	const appName = pkg.name ? pkg.name.replace(/^@nan0web\//, '') : 'app'

	// 2. Setup standard NaN0Web mounts
	if (!config.db) {
		const isTestMode = argv.includes('--test') || env.UI_SNAPSHOT || env.NODE_ENV === 'test'
		db.mount('', /** @type {any} */ (new DBFS({ root: isTestMode ? cwd() : (config.root || 'data'), console: /** @type {any} */ (dbConsole) })))
		if (isTestMode) {
			db.mount('snapshots', /** @type {any} */ (new DBFS({ root: 'snapshots', console: /** @type {any} */ (dbConsole) })))
		}

		const mockHome = env.UI_SNAPSHOT || env.NODE_ENV === 'test'
		const homeDb = new DBFS({
			cwd: mockHome ? cwd() : os.homedir(),
			root: mockHome ? '.test_home' : `.${appName}`,
			console: /** @type {any} */ (dbConsole),
		})
		db.mount('~', /** @type {any} */ (homeDb))
	}

	if (typeof db.seal !== 'function') {
		throw new TypeError(
			'db.seal is not a function (Secure App Bootstrap requires a modern DB version)'
		)
	}

	await db.connect()
	db.seal()

	// 3. I18n setup (Agnostic dynamic loading)
	let t = config.t
	if (!t) {
		const lang = process.env.LANG ? process.env.LANG.split('_')[0].split('-')[0] : 'uk'
		const { I18nDb } = await import('@nan0web/i18n')

		const i18nDb = new I18nDb({ db, locale: lang, dataDir: '' })
		t = await i18nDb.createT(lang)
	}

	// 4. Parse arguments and instantiate model (Model-as-Schema)
	const adapter = new CLiInputAdapter({ console, t })
	const appOptions = { db, logger: console, t, adapter, ...config }
	const model = modelFromArgv(AppModel, argv, appOptions)

	try {
		const res = await runGenerator(model, adapter, appOptions)
		if (config.noExit) return res
		process.exit(res.success && !res.cancelled && res.data?.status !== 'error' ? 0 : 1)
	} catch (err) {
		const error = /** @type {any} */ (err)
		console.error(String(error.stack || error.message || error))
		if (config.noExit) throw error
		process.exit(1)
	}
}
