import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'

describe('v2.12.1 Contract: Hardening', () => {
	it('package.json should have @nan0web/types ^1.7.1', async () => {
		const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
		const version = pkg.devDependencies['@nan0web/types'] || pkg.dependencies['@nan0web/types']
		assert.ok(version, 'Missing @nan0web/types')
		assert.ok(
			version.includes('workspace:*') || version.includes('1.7.1'),
			`Expected ^1.7.1 or workspace:*, got ${version}`
		)
	})

	it('should be able to import verifySnapshot from @nan0web/ui/testing', async () => {
		const { verifySnapshot } = await import('../../../../../../../ui/src/testing/verifySnapshot.js')
		assert.strictEqual(typeof verifySnapshot, 'function')
	})

	it(
		'verifySnapshot should correctly save a JSONL sequence from LogicInspector',
		{ timeout: 9999 },
		async () => {
			const { verifySnapshot, LogicInspector } =
				await import('../../../../../../../ui/src/testing/index.js')
			const { InputModel } = await import('../../../../../domain/prompt/InputModel.js')

			// Mock a model generator (intent stream)
			async function* mockModel() {
				yield {
					type: 'ask',
					field: 'name',
					schema: new InputModel({ UI: 'Enter name', help: 'User name' }),
				}
				return { data: { name: 'test-user' } }
			}

			const intents = await LogicInspector.capture(mockModel(), { inputs: ['test-user'] })

			const testName = 'test-logic-snapshot.jsonl'
			await verifySnapshot({ name: testName, data: intents })

			const savedPath = path.resolve('snapshots/jsonl', testName)
			const content = await fs.readFile(savedPath, 'utf8')

			const lines = content.trim().split('\n')
			assert.strictEqual(lines.length, 2)
			assert.ok(lines[0].includes('"type":"ask"'))
			assert.ok(lines[1].includes('"type":"result"'))

			// Cleanup
			await fs.unlink(savedPath)
		}
	)
})
