import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { confirm } from './confirm.js'
import prompts from 'prompts'

describe('Confirm utility', () => {
    it('returns true when user confirms', async () => {
        prompts.inject([true])
        const result = await confirm({ message: 'Are you sure?' })
        assert.equal(result.value, true)
        assert.equal(result.cancelled, false)
    })

    it('returns false when user denies', async () => {
        prompts.inject([false])
        const result = await confirm({ message: 'Are you sure?', initial: true })
        assert.equal(result.value, false)
        assert.equal(result.cancelled, false)
    })
})
