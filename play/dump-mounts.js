import { show, result, ModelAsApp } from '../src/index.js'

export default class DumpMounts extends ModelAsApp {
	async *run() {
		const db = this._.db
		// In @nan0web/db, mounts are in db.mounts (Map)
		const mounts = Array.from(db.mounts.keys()).sort()
		yield show(`MOUNTS: ${mounts.join(', ')}`)
		
		// Also check specific mount contents if needed
		const appPkg = await db.fetch('@app/package.json')
		if (appPkg) {
			yield show(`APP_PKG: ${appPkg.name}`)
		}

		return result({ success: true })
	}
}
