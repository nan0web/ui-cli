import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJsonPath = path.resolve(__dirname, '../../../../../../package.json')

describe('Release v2.12.2 Contract', () => {
	it('Dependencies use workspace:* protocol', async () => {
		const pkgContent = await fs.readFile(packageJsonPath, 'utf8')
		const pkg = JSON.parse(pkgContent)
		
		const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
		
		const coreDeps = [
			'@nan0web/core', 
			'@nan0web/db', 
			'@nan0web/types', 
			'@nan0web/i18n'
		]
		
		coreDeps.forEach(dep => {
			assert.equal(allDeps[dep], 'workspace:*', `Dependency ${dep} must be workspace:*`)
		})
	})
})
