
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { formatMask } from './mask.js'

describe('Mask Unit Tests', () => {
    describe('formatMask', () => {
        const phoneMask = '+38 (###) ###-##-##'

        it('formats full numeric input correctly', () => {
            const input = '0671234567'
            const expected = '+38 (067) 123-45-67'
            assert.strictEqual(formatMask(input, phoneMask), expected)
        })

        it('handles prefix if user tries to type it (smart prefix correction)', () => {
            // This is the "crooked" scenario where user types prefix
            // New Smart Implementation: detects '38' prefix in mask '+38' and strips it from input.
            // Input: 38 (prefix) + 067...
            const input = '380671234567'

            const result = formatMask(input, phoneMask)

            // Expected by NEW logic: +38 (067) 123-45-67 (Correct)
            const expected = '+38 (067) 123-45-67'

            assert.strictEqual(result, expected)
        })

        it('ignores non-alphanumeric characters in input', () => {
            const input = '067-123-45-67' // User typed dashes
            const expected = '+38 (067) 123-45-67'
            assert.strictEqual(formatMask(input, phoneMask), expected)
        })

        it('handles partial input', () => {
            const input = '067'
            const expected = '+38 (067' // Partial format
            // Wait, does loop stop?
            // cleanValue = '067' (len 3)
            // mask.length is long
            // Loop condition: i < mask.length && v < cleanValue.length
            // i=0(+), v=0 -> res=+
            // i=1(3), v=0 -> res=+3
            // ...
            // i=4((), v=0 -> res=+38 (
            // i=5(#), v=0 -> res=+38 (0, v=1
            // ...
            // This assumes applyMask adds non-placeholders even if v is exhausted?
            // Let's check logic:
            // while (i < mask.length && v < cleanValue.length)
            // It REQUIRES v < cleanValue.length to continue.
            // So if v is exhausted, loop stops.
            // Exception: if maskChar is static, does it increment v? NO.
            // But loop condition has AND. So if v is exhausted, it stops immediately.
            // Meaning static chars AFTER the last input digit are NOT added.

            // Let's trace '067':
            // v=0 ('0'). Loop runs.
            // i=0(+), static. res='+', v=0.
            // i=1(3), static. res='+3', v=0.
            // ...
            // i=4((), static. res='+38 (', v=0.
            // i=5(#), placeholder. res='+38 (0', v=1.
            // i=6(#), placeholder. res='+38 (06', v=2.
            // i=7(#), placeholder. res='+38 (067', v=3.
            // Loop checks v < 3. v=3. false. Stop.

            // So expected is indeed '+38 (067'
            assert.strictEqual(formatMask(input, phoneMask), '+38 (067')
        })

        it('does not append suffix if input is short', () => {
            const input = '067'
            const result = formatMask(input, phoneMask)
            assert.ok(!result.includes(')'), 'Should not include closing bracket yet')
        })

        it('handles excess length by truncation', () => {
            const input = '067123456799999'
            const expected = '+38 (067) 123-45-67'
            assert.strictEqual(formatMask(input, phoneMask), expected)
        })
    })
})
