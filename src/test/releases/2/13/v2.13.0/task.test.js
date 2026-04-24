import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PlaygroundTest } from '../../../../../ui/test/index.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIN = path.resolve(__dirname, '../../../../../../bin/nan0cli.js')
const PLAY_DIR = path.resolve(__dirname, '../../../../../../play')

describe('Release v2.13.0 — CLI Mount Protocol Integration', () => {
	
	it('supports --mount play shorthand', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		const { stdout, exitCode } = await pt.run([
			BIN, 
			'--mount', 'play', 
			path.join(PLAY_DIR, 'dump-mounts.js')
		])

		assert.equal(exitCode, 0)
		assert.ok(stdout.includes('MOUNTS: '), 'Should see mounts list')
		assert.ok(stdout.includes('@app'), 'Should see @app mount')
		assert.ok(stdout.includes('@docs'), 'Should see @docs mount')
		assert.ok(stdout.includes('@play'), 'Should see @play mount')
	})

	it('supports --mount-data and --mount-app separately', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		const { stdout, exitCode } = await pt.run([
			BIN, 
			'--mount-data', 'play', 
			'--mount-app', '.',
			path.join(PLAY_DIR, 'dump-mounts.js')
		])

		assert.equal(exitCode, 0)
		assert.ok(stdout.includes('MOUNTS: '))
		assert.ok(stdout.includes('@app'))
	})

	it('supports custom dest:dsn format', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		const { stdout, exitCode } = await pt.run([
			BIN, 
			'--mount', 'custom:play', 
			path.join(PLAY_DIR, 'dump-mounts.js')
		])

		assert.equal(exitCode, 0)
		assert.ok(stdout.includes('custom'), 'Should have "custom" in mounts list')
	})

	it('allows --mount with protocol:// DSNs without splitting', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		const { stdout, exitCode } = await pt.run([
			BIN, 
			'--mount', 'memory://', 
			path.join(PLAY_DIR, 'dump-mounts.js')
		])

		assert.equal(exitCode, 0)
		assert.ok(stdout.includes('MOUNTS: '))
	})
})
