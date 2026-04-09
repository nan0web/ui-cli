import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { Model } from '@nan0web/types'

import { bootstrapApp } from './bootstrapApp.js'
import DB from '@nan0web/db'

describe('bootstrapApp', () => {
	it('should load defaults', async () => {
		class SimpleApp extends Model {
			static help = {
				help: 'Only help is an option',
				default: false
			}
			constructor(data = {}, options = {}) {
				super(data, options)
				/** @type {boolean} Only help is an option */ this.help
			}
			async * run() {
				yield { type: 'result', data: 'processed' }
			}
		}
		const db = new DB()
		const result = await bootstrapApp(SimpleApp, { db, noExit: true })
		assert.deepStrictEqual(result, { success: true, data: undefined, cancelled: false })
	})
})
