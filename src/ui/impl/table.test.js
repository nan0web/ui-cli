import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { table } from './table.js'
import { VirtualTerminal } from '../test/VirtualTerminal.js'

describe('Table Implementation Unit Tests', () => {
    let vt
	beforeEach(() => { vt = new VirtualTerminal() })
	afterEach(() => { vt.restore() })

    it('should render static table successfully', async () => {
        const data = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }]
        const res = await table({ data, interactive: false })
        
        assert.equal(res.cancelled, false)
        assert.deepEqual(res.value, data)
        const output = vt.output.join('')
        assert.ok(output.includes('Apple'))
        assert.ok(output.includes('Banana'))
    })
})
