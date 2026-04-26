import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Spinner } from '../../../../../../src/ui/impl/spinner.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('v2.13.1 Patch Release', () => {
	it('should have stop, success, and error methods on Spinner instance', () => {
		const s = new Spinner({ message: 'test' })
		
		assert.equal(typeof s.stop, 'function', 'Spinner should have stop method')
		assert.equal(typeof s.success, 'function', 'Spinner should have success method')
		assert.equal(typeof s.error, 'function', 'Spinner should have error method')
		
		// Ensure they don't throw when called
		s.stop('done')
		assert.equal(s.message, 'done')
		assert.equal(s.status, '✔')

		s.success('ok')
		assert.equal(s.message, 'ok')
		assert.equal(s.status, '✔')

		s.error('failed')
		assert.equal(s.message, 'failed')
		assert.equal(s.status, '✖')
	})

	it('should have generated stop method in spinner.d.ts', () => {
		const dtsPath = path.resolve(__dirname, '../../../../../../types/ui/impl/spinner.d.ts')
		const content = fs.readFileSync(dtsPath, 'utf8')
		
		assert.ok(content.includes('stop(msg?: string): void;'), 'spinner.d.ts must contain stop(msg?: string) definition')
		assert.ok(content.includes('success(msg?: string): void;'), 'spinner.d.ts must contain success(msg?: string) definition')
		assert.ok(content.includes('error(msg?: string): void;'), 'spinner.d.ts must contain error(msg?: string) definition')
	})
})
