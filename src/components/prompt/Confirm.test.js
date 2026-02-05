
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Confirm } from './Confirm.js'
import prompts from 'prompts'

describe('Confirm Component', () => {
    it('renders and returns boolean', async () => {
        prompts.inject([true])

        const component = Confirm({
            message: 'Are you sure?',
            initial: false
        })

        assert.equal(component.type, 'Confirm')

        const result = await component.execute()
        assert.equal(result.value, true)
    })
})
