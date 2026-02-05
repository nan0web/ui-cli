
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PlaygroundTest } from '../test/index.js'

describe('Mask Visual Formatting', () => {
    it('outputs formatted value in success line', async () => {
        const pt = new PlaygroundTest({ PLAY_DEMO_SEQUENCE: '0673861050' }, { includeDebugger: false })
        const { stdout } = await pt.run(['play/main.js', '--demo=mask', '--lang=uk'])

        // Clean output
        const cleanStdout = stdout.replace(/\x1B\[[0-9;]*[mK]/g, '')

        console.log('STDOUT_DEBUG:\n', cleanStdout)

        // Find success line
        const successLine = cleanStdout.split('\n').find(l => l.includes('✔') && l.includes('Контактний телефон'))

        const expected = '+38 (067) 386-10-50'

        assert.ok(successLine.includes(expected), `Success line must contain formatted value. Got: ${successLine}`)
    })
})
