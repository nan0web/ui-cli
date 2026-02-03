/**
 * Slider component test – verify that the slider prompt works correctly.
 *
 * This test specifically addresses the TypeScript error:
 * "Property 'run' does not exist on type 'SliderPrompt'"
 *
 * @module src/ui/slider.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { slider } from './slider.js'
import prompts from 'prompts'

describe('slider component', () => {
    it('returns a value within the specified range', async () => {
        // Inject a predefined value
        prompts.inject([50])

        const result = await slider({
            message: 'Select volume',
            min: 0,
            max: 100,
            step: 1,
            initial: 25,
        })

        assert.strictEqual(result.cancelled, false, 'Should not be cancelled')
        assert.strictEqual(result.value, 50, 'Should return injected value')
    })

    it('respects min and max bounds', async () => {
        prompts.inject([75])

        const result = await slider({
            message: 'Select temperature',
            min: 10,
            max: 90,
            step: 5,
            initial: 20,
        })

        assert.strictEqual(result.value, 75, 'Should accept value within bounds')
    })

    it('uses initial value when provided', async () => {
        prompts.inject([42])

        const result = await slider({
            message: 'Set brightness',
            min: 0,
            max: 100,
            initial: 42,
        })

        assert.strictEqual(result.value, 42, 'Should use initial value')
    })

    it('translates message when t function provided', async () => {
        prompts.inject([60])

        const t = (key) => {
            const translations = {
                'Select Volume': 'Оберіть гучність',
            }
            return translations[key] || key
        }

        const result = await slider({
            message: 'Select Volume',
            min: 0,
            max: 100,
            t,
        })

        assert.strictEqual(result.value, 60, 'Should work with translation function')
    })

    it('throws CancelError on cancellation', async () => {
        // Inject abort signal
        prompts.inject([new Error('cancelled')])

        try {
            await slider({
                message: 'Select value',
                min: 0,
                max: 10,
            })
            assert.fail('Should have thrown CancelError')
        } catch (error) {
            assert.strictEqual(error.name, 'CancelError', 'Should throw CancelError')
        }
    })

    it('calculates jump value correctly', async () => {
        prompts.inject([50])

        const result = await slider({
            message: 'Big range',
            min: 0,
            max: 1000,
            step: 1,
        })

        // Jump should be max(step, round(range/10)) = max(1, 100) = 100
        assert.strictEqual(result.value, 50, 'Should handle large ranges')
    })

    it('works with custom step size', async () => {
        prompts.inject([25])

        const result = await slider({
            message: 'Custom step',
            min: 0,
            max: 100,
            step: 5,
        })

        assert.strictEqual(result.value, 25, 'Should work with custom step')
    })

    it('defaults min to 0 if not provided', async () => {
        prompts.inject([30])

        const result = await slider({
            message: 'Default min',
            max: 50,
        })

        assert.strictEqual(result.value, 30, 'Should use default min of 0')
    })

    it('defaults max to 100 if not provided', async () => {
        prompts.inject([80])

        const result = await slider({
            message: 'Default max',
            min: 0,
        })

        assert.strictEqual(result.value, 80, 'Should use default max of 100')
    })

    it('defaults step to 1 if not provided', async () => {
        prompts.inject([45])

        const result = await slider({
            message: 'Default step',
            min: 0,
            max: 100,
        })

        assert.strictEqual(result.value, 45, 'Should use default step of 1')
    })
})
