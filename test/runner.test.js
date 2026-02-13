import { describe, it } from 'node:test'
import assert from 'node:assert'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

const binPath = resolve(process.cwd(), 'bin/nan0cli.js')

describe('nan0cli runner', () => {
	/** @docs */
	it('fails gracefully without entry point', () => {
		const tmpDir = mkdtempSync(resolve(tmpdir(), 'nan0cli-test-'))
		try {
			execSync(`node ${binPath}`, {
				encoding: 'utf8',
				cwd: tmpDir,
				input: '',
				stdio: 'pipe',
			})
			assert.fail('Should have exited with code 1')
		} catch (error) {
			assert.strictEqual(error.status, 1)
			const output = (error.stdout || '') + (error.stderr || '')
			assert.ok(output.includes('Config Error'))
		} finally {
			rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	/** @docs */
	it('reads nan0web.cli.entry from package.json', () => {
		const tmpDir = mkdtempSync(resolve(tmpdir(), 'nan0cli-entry-'))
		const pkg = { name: 'test-app', type: 'module', nan0web: { cli: { entry: 'app.js' } } }
		writeFileSync(resolve(tmpDir, 'package.json'), JSON.stringify(pkg))
		writeFileSync(resolve(tmpDir, 'app.js'), 'export default class {}')
		try {
			execSync(`node ${binPath}`, {
				encoding: 'utf8',
				cwd: tmpDir,
				input: '',
				stdio: 'pipe',
			})
		} catch (error) {
			// CLI may fail at run() stage, but NOT with "Config Error"
			const output = (error.stdout || '') + (error.stderr || '')
			assert.ok(!output.includes('Config Error'), 'Should have found entry point')
		} finally {
			rmSync(tmpDir, { recursive: true, force: true })
		}
	})
})
