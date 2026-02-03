
import { describe, it, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { tree } from './tree.js'
import { EventEmitter } from 'node:events'
import process from 'node:process'

describe('Tree Component', () => {
    let stdin
    let stdout
    let output = ''

    // Store original process.stdin/stdout
    const originalStdin = Object.getOwnPropertyDescriptor(process, 'stdin')
    const originalStdout = Object.getOwnPropertyDescriptor(process, 'stdout')

    beforeEach(() => {
        // Mock Stdin
        stdin = new EventEmitter()
        stdin.setRawMode = mock.fn()
        stdin.resume = mock.fn()
        stdin.pause = mock.fn()
        stdin.removeListener = mock.fn()

        Object.defineProperty(process, 'stdin', { value: stdin, configurable: true, writable: true })

        // Mock Stdout
        output = ''
        stdout = {
            write: mock.fn((str) => {
                output += str
                return true
            }),
            rows: 24,
            columns: 80
        }
        Object.defineProperty(process, 'stdout', { value: stdout, configurable: true, writable: true })
    })

    afterEach(() => {
        // Restore
        if (originalStdin) Object.defineProperty(process, 'stdin', originalStdin)
        if (originalStdout) Object.defineProperty(process, 'stdout', originalStdout)
        mock.reset()
    })

    const emitKey = (name, sequence = undefined, ctrl = false) => {
        stdin.emit('keypress', sequence || name, { name, sequence: sequence || name, ctrl })
    }

    const wait = (ms = 10) => new Promise(r => setTimeout(r, ms))

    it('renders basic tree and returns selection', async () => {
        const root = { name: 'root', type: 'dir', children: [{ name: 'child', type: 'file' }] }

        const promise = tree({ tree: root, message: 'Test Tree' })
        await wait()

        assert.match(output, /Test Tree/)
        assert.match(output, /root/)
        assert.match(output, /▶/) // Collapsed by default

        // Expand root
        emitKey('right')
        await wait()
        assert.match(output, /▼/) // Expanded
        assert.match(output, /child/) // Should verify 'child' is visible

        // Move down to child
        emitKey('down')
        await wait()

        // Select child
        emitKey('enter')
        const result = await promise

        assert.equal(result.name, 'child')
    })

    it('supports localization via t function', async () => {
        const t = mock.fn((k) => {
            if (k === 'tree.empty') return 'ПУСТО'
            if (k === 'Select:') return 'Оберіть:'
            if (k === 'tree.help.single') return 'Інструкція'
            return k
        })

        const promise = tree({
            tree: [], // Empty tree
            message: 'Select:',
            t
        })
        await wait()

        assert.match(output, /ПУСТО/)
        assert.match(output, /Оберіть:/)

        emitKey('c', 'c', true) // Ctrl+C to exit
        await assert.rejects(promise, /Cancelled/)

        // assert.equal(t.mock.callCount(), 3) // At least called
    })

    it('handles multi-select', async () => {
        const nodes = [
            { name: '1', type: 'file' },
            { name: '2', type: 'file' }
        ]

        const promise = tree({ tree: nodes, mode: 'multi' })
        await wait()

        // Select first
        emitKey('space')
        await wait()
        assert.match(output, /◉/) // Checked

        // Move down
        emitKey('down')
        await wait()

        // Select second
        emitKey('space')
        await wait()

        // Confirm
        emitKey('enter')
        const result = await promise

        assert.equal(result.length, 2)
        assert.equal(result[0].name, '1')
        assert.equal(result[1].name, '2')
    })
})
