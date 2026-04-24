import os from 'node:os'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
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
 * @property {string} [appName] Optional application name.
 */

async function readParams(config) {
	const argv = config.argv ?? process.argv.slice(2)
	const env = config.env ?? process.env
	const cwd = config.cwd ?? process.cwd

	const isDebug = argv.includes('--debug')
	const isTestMode = argv.includes('--test') || env.UI_SNAPSHOT || env.NODE_ENV === 'test' || env.NODE_TEST_CONTEXT || env.npm_lifecycle_event === 'test'

	const console = new Logger({ level: Logger.detectLevel(argv) })
	const dbConsole = new Logger({ level: isDebug ? 'debug' : 'error' })

	return { argv, env, cwd, isDebug, isTestMode, console, dbConsole }
}

async function resolveDsn(dsn, appCwd, dbConsole) {
	const path = await import('node:path')
	if (!dsn || dsn === '.' || dsn.startsWith('fs://') || !dsn.match(/^[a-z]+:\/\//)) {
		const rawPath = dsn.startsWith('fs://') ? dsn.slice(5) : dsn
		const absRoot = path.isAbsolute(rawPath) ? rawPath : path.resolve(appCwd, rawPath)
		return new DBFS({ cwd: absRoot, root: '', console: /** @type {any} */ (dbConsole) })
	}
	if (dsn.startsWith('redis://')) {
		// @ts-ignore
		const { default: DBRedis } = await import('@nan0web/db-redis').catch(() => {
			throw new Error(`redis:// DSN requires @nan0web/db-redis`)
		})
		return new DBRedis({ dsn, console: /** @type {any} */ (dbConsole) })
	}
	if (dsn.startsWith('sqlite://')) {
		// @ts-ignore
		const { default: DBSqlite } = await import('@nan0web/db-sqlite').catch(() => {
			throw new Error(`sqlite:// DSN requires @nan0web/db-sqlite`)
		})
		return new DBSqlite({ dsn, console: /** @type {any} */ (dbConsole) })
	}
	if (dsn.startsWith('memory://')) {
		const mem = new DB({ console: /** @type {any} */ (dbConsole) })
		await mem.connect()
		return mem
	}
	throw new Error(`Unknown DSN protocol: ${dsn}`)
}

async function readMounts(db, { argv, appCwd, pkg, dbConsole, isTestMode, config }) {
	const path = await import('node:path')
	const explicitMounts = []
	const appArgv = []

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === '--cwd' || arg.startsWith('--cwd=')) {
			appCwd = arg.startsWith('--cwd=') ? arg.slice(6) : argv[++i]
		} else if (arg === '--mount-data' || arg.startsWith('--mount-data=')) {
			const val = arg.startsWith('--mount-data=') ? arg.slice(13) : argv[++i]
			explicitMounts.push({ dest: '', dsn: val || 'data' })
		} else if (arg === '--mount-app' || arg.startsWith('--mount-app=')) {
			const val = arg.startsWith('--mount-app=') ? arg.slice(12) : argv[++i]
			explicitMounts.push({ dest: '@app', dsn: val || '.' })
		} else if (arg === '--mount-docs' || arg.startsWith('--mount-docs=')) {
			const val = arg.startsWith('--mount-docs=') ? arg.slice(13) : argv[++i]
			explicitMounts.push({ dest: '@docs', dsn: val || 'docs' })
		} else if (arg === '--mount-play' || arg.startsWith('--mount-play=')) {
			const val = arg.startsWith('--mount-play=') ? arg.slice(13) : argv[++i]
			explicitMounts.push({ dest: '@play', dsn: val || 'play' })
		} else if (arg === '--mount' || arg.startsWith('--mount=')) {
			const val = arg.startsWith('--mount=') ? arg.slice(8) : argv[++i]
			if (val && val.includes(':') && !val.match(/^[a-z]+:\/\//)) {
				const sep = val.indexOf(':')
				explicitMounts.push({ dest: val.slice(0, sep), dsn: val.slice(sep + 1) })
			} else {
				explicitMounts.push({ dest: '', dsn: val || 'data' })
			}
		} else if (
			arg === '--data' ||
			arg === '--dsn' ||
			arg.startsWith('--data=') ||
			arg.startsWith('--dsn=')
		) {
			const val = arg.includes('=') ? arg.split('=')[1] : argv[++i]
			explicitMounts.push({ dest: '', dsn: val || 'data' })
		} else {
			appArgv.push(arg)
		}
	}

	const pkgMounts = pkg?.nan0web?.mounts || {}
	const pkgMountList = Array.isArray(pkgMounts)
		? pkgMounts.map((v) =>
				typeof v === 'string' && v.includes(':')
					? { dest: v.slice(0, v.indexOf(':')), dsn: v.slice(v.indexOf(':') + 1) }
					: { dest: '', dsn: v }
			)
		: Object.entries(pkgMounts).map(([dest, dsn]) => ({ dest, dsn }))

	const cliDests = new Set(explicitMounts.map((m) => m.dest))
	const mergedMounts = [...explicitMounts, ...pkgMountList.filter((m) => !cliDests.has(m.dest))]

	for (const { dest, dsn } of mergedMounts) {
		const adapter = await resolveDsn(dsn, appCwd, dbConsole)
		db.mount(dest, adapter)
	}

	// Standard defaults
	if (!db.mounts?.has('')) {
		db.mount(
			'',
			/** @type {any} */ (
				new DBFS({
					root: isTestMode ? appCwd : config.root || 'data',
					console: /** @type {any} */ (dbConsole),
				})
			)
		)
	}
	if (!db.mounts?.has('@app')) {
		db.mount(
			'@app',
			/** @type {any} */ (
				new DBFS({ cwd: appCwd, root: '', console: /** @type {any} */ (dbConsole) })
			)
		)
	}
	if (!db.mounts?.has('~')) {
		const appName = config.appName || (pkg.name ? pkg.name.replace(/^@\w+\//, '') : 'app')
		const mockHome = isTestMode
		const homeDb = new DBFS({
			cwd: mockHome ? appCwd : os.homedir(),
			root: mockHome ? '.test_home' : `.${appName}`,
			console: /** @type {any} */ (dbConsole),
		})
		db.mount('~', /** @type {any} */ (homeDb))
	}

	// @system — Global NaN0Web config and store
	if (!db.mounts?.has('@system')) {
		const sysHome = isTestMode
			? path.resolve(appCwd, '.test_home')
			: path.join(os.homedir(), '.nan0web')
		db.mount(
			'@system',
			new DBFS({ cwd: sysHome, root: '', console: /** @type {any} */ (dbConsole) })
		)
	}

	// @docs — Documentation namespace
	if (!db.mounts?.has('@docs')) {
		db.mount(
			'@docs',
			new DBFS({ cwd: appCwd, root: 'docs', console: /** @type {any} */ (dbConsole) })
		)
	}

	// @play — Sandbox namespace
	if (!db.mounts?.has('@play')) {
		db.mount(
			'@play',
			new DBFS({ cwd: appCwd, root: 'play', console: /** @type {any} */ (dbConsole) })
		)
	}

	return { appArgv, appCwd }
}

async function resolveModel(AppModel, { pkg, appCwd }) {
	const path = await import('node:path')
	let FinalModel = AppModel
	if (!AppModel || AppModel.name === 'App') {
		const candidates = [
			pkg?.exports?.['./cli'],
			pkg?.exports?.['./app'],
			pkg?.exports?.['./ui/cli'],
			pkg?.nan0web?.cli?.entry,
			'src/cli.js',
			'src/domain/App.js',
		]
			.map((c) => (typeof c === 'string' ? c : c?.import || c?.default))
			.filter(Boolean)

		for (const candidate of candidates) {
			const absPath = path.resolve(appCwd, candidate)
			try {
				const mod = await import(pathToFileURL(absPath).href)
				FinalModel =
					mod.default ||
					mod.App ||
					mod.Messages ||
					Object.values(mod).find((m) => typeof m === 'function' && m.prototype?.run)
				if (FinalModel) break
			} catch {}
		}
	}

	if (!FinalModel) {
		const { App } = await import('../domain/App.js')
		FinalModel = App
	}
	return FinalModel
}

/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 *
 * @param {typeof import('@nan0web/types').Model} [AppModel]
 * @param {BootstrapAppConfig} [config={}]
 */
export async function bootstrapApp(AppModel, config = {}) {
	// 1. Read Params
	const { argv, isTestMode, console, dbConsole, cwd } = await readParams(config)

	// 2. Initialize DB
	const db = config.db || new DB({ console: /** @type {any} */ (dbConsole) })
	const fs = new DBFS({ console: /** @type {any} */ (dbConsole) })
	const pkg = await fs.loadDocument('package.json', {})

	// 3. Read Mounts
	const { appArgv, appCwd } = await readMounts(db, {
		argv,
		appCwd: cwd(),
		pkg,
		dbConsole,
		isTestMode,
		config,
	})

	if (typeof db.seal !== 'function') {
		throw new TypeError(
			'db.seal is not a function (Secure App Bootstrap requires a modern DB version)'
		)
	}

	db.seal()
	await db.connect()

	// 4. I18n setup
	let t = config.t
	const locIdx = argv.indexOf('--locale')
	const lIdx = argv.indexOf('-l')
	const langStr =
		appArgv.find((a) => a.startsWith('--locale='))?.slice(9) ||
		(locIdx !== -1 && argv[locIdx + 1]) ||
		(lIdx !== -1 && argv[lIdx + 1])
	const lang = langStr || (process.env.LANG ? process.env.LANG.split('_')[0].split('-')[0] : (isTestMode ? 'en' : 'uk'))

	if (!t) {
		const { I18nDb } = await import('@nan0web/i18n')
		const i18nDb = new I18nDb({ db, locale: lang, dataDir: '' })
		t = await i18nDb.createT(lang)
	}

	// 5. Resolve Model
	const FinalModel = await resolveModel(AppModel, { pkg, appCwd })

	const adapter = new CLiInputAdapter({ console, t })
	const appOptions = { db, logger: console, t, adapter, locale: lang, ...config }
	const model = modelFromArgv(FinalModel, appArgv, appOptions)

	try {
		const res = await runGenerator(/** @type {any} */ (model), adapter, appOptions)
		if (res.cancelled) {
			process.stdout.write('\nSelection cancelled.\n')
		}
		if (config.noExit) return res
		const exitCode = res.success && !res.cancelled && res.data?.status !== 'error' ? 0 : 1
		
		if (isTestMode && !process.env.UI_SNAPSHOT) {
			process.exit(exitCode)
		} else {
			setTimeout(() => process.exit(exitCode), 5)
		}
	} catch (err) {
		const error = /** @type {any} */ (err)
		console.error(String(error.stack || error.message || error))
		if (config.noExit) throw error
		
		if (isTestMode && !process.env.UI_SNAPSHOT) {
			process.exit(1)
		} else {
			setTimeout(() => process.exit(1), 20)
		}
	}
}
