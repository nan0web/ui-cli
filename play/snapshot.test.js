/**
 * Snapshot tests – verify exact CLI output for critical demos.
 * Run with UPDATE_SNAPSHOTS=1 to regenerate golden files.
 *
 * @module play/snapshot.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { PlaygroundTest } from '../src/test/index.js'

/**
 * Removes ANSI escape codes, time durations, and clearscreen artifacts.
 * @param {string} str
 */
function normalizeOutput(str) {
    return str
        // Remove ANSI codes
        .replace(/\x1B\[[0-9;]*[mK]/g, '')
        // Normalize spinner durations [00:02] -> [XX:XX]
        .replace(/\[\d{2}:\d{2}\]/g, '[XX:XX]')
        // Remove clear screen empty lines at start
        .replace(/^\s+/, '')
        // Trim end
        .trim()
}

const SNAPSHOT_DIR = path.join(process.cwd(), 'play', 'snapshots')

async function verifySnapshot(name, env) {
    const pt = new PlaygroundTest({ ...process.env, ...env }, { includeDebugger: false, feedStdin: true })
    const { stdout, stderr } = await pt.run(['play/main.js'])

    // Include stderr for validation errors
    const combined = stdout + (stderr ? '\n--- STDERR ---\n' + stderr : '')
    const actual = normalizeOutput(combined)
    const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.snap`)

    if (process.env.UPDATE_SNAPSHOTS) {
        fs.writeFileSync(snapshotPath, actual, 'utf8')
        console.log(`Updated snapshot: ${name}`)
        return
    }

    if (!fs.existsSync(snapshotPath)) {
        console.warn(`WARN: Snapshot not found: ${name}. Creating it...`)
        fs.writeFileSync(snapshotPath, actual, 'utf8')
        return
    }

    const expected = fs.readFileSync(snapshotPath, 'utf8')

    try {
        assert.strictEqual(actual, expected)
    } catch (e) {
        console.error(`\nSnapshot mismatch for ${name}!`)
        throw e
    }
}

// NOTE: Exit is item 19.
const SCENARIOS = [
    {
        name: 'select',
        seq: '2,3,19'
    },
    {
        name: 'form_valid',
        seq: '4,snap_user,25,2,19'
    },
    {
        name: 'form_validation_error',
        seq: '4,snap_user,3,25,2,19'
    },
    {
        name: 'view_components',
        seq: '6,a,19'
    },
    {
        name: 'nav_components',
        seq: '7,a,19'
    },
    {
        name: 'tree_view',
        seq: '8,package.json,src,play,a,19'
    },
    {
        name: 'autocomplete',
        seq: '11,Ukraine,19',
        seq_uk: '11,Укр,19'
    },
    {
        name: 'advanced_form',
        seq: '13,adv_user,pass,1234567890,y,Admin,19'
    },
    {
        name: 'toggle',
        seq: '14,19'
    },
    {
        name: 'slider',
        seq: '15,10,120,555000,700,19'
    },
    {
        name: 'datetime',
        seq: '18,2026-01-01,10:20,2026-01-21 16:20,a,19'
    }
]

const LANGUAGES = ['en', 'uk']

describe('Snapshot Verification (Golden Master)', () => {
    // Ensure dir exists
    if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })

    for (const lang of LANGUAGES) {
        describe(`Language: ${lang}`, () => {
            for (const scenario of SCENARIOS) {
                const seq = (lang === 'uk' && scenario.seq_uk) ? scenario.seq_uk : scenario.seq
                it(`matches snapshot: ${scenario.name} [${lang}]`, async () => {
                    await verifySnapshot(`${scenario.name}.${lang}`, {
                        LANG: lang,
                        PLAY_DEMO_SEQUENCE: seq
                    })
                })
            }
        })
    }
})
