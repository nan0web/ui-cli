
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PlaygroundTest } from '../src/test/index.js'

describe('terminal height adaptation', () => {
    it('sets dynamic limit and translates long list', async () => {
        const pt = new PlaygroundTest({
            PLAY_DEMO_SEQUENCE: '9,15', // 9: Long List, 15: Exit
            LANG: 'uk', // Force Ukrainian locale
            TERM: 'xterm',
            COLUMNS: '80',
            LINES: '15'
        }, { includeDebugger: false, feedStdin: true })

        const { stdout, exitCode } = await pt.run(['play/main.js'])

        assert.strictEqual(exitCode, 0)
        // Check for Ukrainian strings from uk.js
        assert.ok(stdout.includes('Генерація 100 елементів'), 'Should translate "Generating 100 items"')
        assert.ok(stdout.includes('Лише 10 буде видно одночасно'), 'Should translate "Only 10 visible"')
    })
})
