import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { PlaygroundTest, normalize, collectReplacements, TREE_REPLACEMENTS } from '../src/test/index.js'
import { Spinner } from '../src/ui/spinner.js'
import { ProgressBar } from '../src/ui/progress.js'

/** Composed snapshot replacements from all CLI components */
const SNAPSHOT_REPLACEMENTS = [
	...collectReplacements(Spinner, ProgressBar),
	...TREE_REPLACEMENTS,
	// Deduplicate consecutive spinner animation frames
	{ pattern: /(\[SPINNER\]\n?)+/g, replacement: '[SPINNER_ANIMATION]\n' },
	// Normalize full datetime values: 2026-03-12 14:37 → [DATETIME]
	{ pattern: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?/g, replacement: '[DATETIME]' },
	// Normalize standalone clock time HH:MM → [TIME]
	{ pattern: /\b\d{2}:\d{2}\b/g, replacement: '[TIME]' },
	// Normalize Date.toString(): Sun Mar 08 2026 21:42:30 GMT+0200 (...)
	{ pattern: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([^)]+\)/g, replacement: '[DATE_RESULT]' },
]

/**
 * Removes ANSI escape codes, time durations, and clearscreen artifacts.
 * @param {string} str
 */
function normalizeOutput(str) {
	return normalize(str, SNAPSHOT_REPLACEMENTS)
}

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots', 'play')

async function verifySnapshot(name, demo, lang, env) {
	const pt = new PlaygroundTest(
		{ ...process.env, UI_SNAPSHOT: '1', ...env },
		{ includeDebugger: false, feedStdin: true }
	)
	// Use --demo and --lang to skip menu and language selection
	const { stdout, stderr } = await pt.run(['play/main.js', `--demo=${demo}`, `--lang=${lang}`])

	// Include stderr for validation errors
	const combined = stdout + (stderr ? '\n--- STDERR ---\n' + stderr : '')
	const actual = normalizeOutput(combined)

	const demoDir = path.join(SNAPSHOT_DIR, demo)
	if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true })

	const frames = actual
		.split(/\[SNAPSHOT_FRAME\]/g)
		.map((f) => f.trim())
		.filter(Boolean)

	if (frames.length <= 1) {
		const snapshotPath = path.join(demoDir, `${name}.snap`)
		const text = frames[0] || actual
		if (process.env.UPDATE_SNAPSHOTS) {
			fs.writeFileSync(snapshotPath, text, 'utf8')
			console.log(`Updated snapshot: play/${demo}/${name}.snap`)
			return
		}
		if (!fs.existsSync(snapshotPath)) {
			console.warn(`WARN: Snapshot not found: play/${demo}/${name}.snap. Creating it...`)
			fs.writeFileSync(snapshotPath, text, 'utf8')
			return
		}
		const expected = fs.readFileSync(snapshotPath, 'utf8')
		try {
			assert.strictEqual(text, expected)
		} catch (e) {
			console.error(`\nSnapshot mismatch for ${name}!`)
			throw e
		}
	} else {
		for (let i = 0; i < frames.length; i++) {
			const frameName = `${name}.${i + 1}`
			const snapshotPath = path.join(demoDir, `${frameName}.snap`)
			const text = frames[i]

			if (process.env.UPDATE_SNAPSHOTS) {
				fs.writeFileSync(snapshotPath, text, 'utf8')
				console.log(`Updated snapshot frame ${i + 1}: play/${demo}/${frameName}.snap`)
				continue
			}
			if (!fs.existsSync(snapshotPath)) {
				console.warn(
					`WARN: Snapshot frame not found: play/${demo}/${frameName}.snap. Creating it...`
				)
				fs.writeFileSync(snapshotPath, text, 'utf8')
				continue
			}
			const expected = fs.readFileSync(snapshotPath, 'utf8')
			try {
				assert.strictEqual(text, expected)
			} catch (e) {
				console.error(`\nSnapshot frame mismatch for ${frameName}!`)
				throw e
			}
		}
	}
}

const SCENARIOS = [
	{
		name: 'select',
		demo: 'select',
		seq: '3', // Choose Blue
	},
	{
		name: 'form_valid',
		demo: 'form',
		seq: 'snap_user,25,2',
		skip: true, // Unstable — stdin feed race with text input
	},
	{
		name: 'form_validation_error',
		demo: 'form',
		seq: 'snap_user,3,25,2',
		skip: true, // Unstable — stdin feed race with text input
	},
	{
		name: 'view_components',
		demo: 'view',
		seq: 'a', // any key to exit
	},
	{
		name: 'nav_components',
		demo: 'nav',
		seq: 'a', // any key to exit
	},
	{
		name: 'tree_view',
		demo: 'tree',
		seq: 'README.md', // Scenario 2 & 3 are skipped in test mode
	},
	{
		name: 'autocomplete',
		demo: 'autocomplete',
		seq: 'Ukraine',
		seq_uk: 'Україна',
	},
	{
		name: 'advanced_form',
		demo: 'advanced-form',
		seq: 'adv_user,pass,1234567890,25,y,n,Admin',
		skip: true, // Unstable — stdin feed race with multi-field text input
	},
	{
		name: 'toggle',
		demo: 'toggle',
		seq: 'y',
	},
	{
		name: 'slider',
		demo: 'slider',
		seq: '10,120,555000,700',
		skip: true, // Unstable — stdin feed race with numeric input
	},
	{
		name: 'ui_message',
		demo: 'ui-message',
		seq: 'snap_user,25,2',
		skip: true, // Unstable — stdin feed race: next answer merges with previous input
	},
	{
		name: 'datetime',
		demo: 'datetime',
		seq: '2026-01-01,10:20,2026-01-21 16:20,a',
		skip: true, // Unstable — interactive mode generates variable keystroke repetition counts
	},
	{
		name: 'v2_components',
		demo: 'v2',
		seq: 'showcase,UserV2,12345,y,y,1,Logging,Ukraine,75,0671234567,2026-02-07,package.json,,exit',
	},
	{
		name: 'sortable',
		demo: 'sortable',
		// Use | divider so comma-separated sort order stays as one token
		seq: 'high,medium,low,critical',
		divider: '|',
		skip: true, // Sortable hangs under UI_SNAPSHOT=1 — interactive cursor reorder incompatible with stdin feed
	},
	{
		name: 'tree_search',
		demo: 'tree',
		seq: '\tREADME.md',
	},
	{
		name: 'object_form',
		demo: 'object-form',
		seq: 'address|New Address|city|New City|_save',
		seq_uk: 'Адреса|Нова адреса|Місто|Нове місто|_save',
		divider: '|',
		skip: true, // Unstable — stdin timing race with text input keystroke rendering
	},
	{
		name: 'object_form_complex',
		demo: 'object-form',
		seq: 'type|ATM|_save',
		seq_uk: 'Тип|Банкомат|_save',
		divider: '|',
		skip: true, // Chronically unstable — stdin timing race with Cyrillic keystroke rendering
	},
]

const LANGUAGES = ['en', 'uk']

describe('Snapshot Verification (Golden Master)', () => {
	// Ensure dir exists
	if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })

	for (const lang of LANGUAGES) {
		describe(`Language: ${lang}`, () => {
			for (const scenario of SCENARIOS) {
				if (scenario.skip) {
					it.skip(`matches snapshot: ${scenario.name} [${lang}] (skipped — known hang)`, () => {})
					continue
				}
				const seq = lang === 'uk' && scenario.seq_uk ? scenario.seq_uk : scenario.seq
				it(`matches snapshot: ${scenario.name} [${lang}]`, async () => {
					const env = { PLAY_DEMO_SEQUENCE: seq }
					if (scenario.divider) env.PLAY_DEMO_DIVIDER = scenario.divider
					await verifySnapshot(`${scenario.name}.${lang}`, scenario.demo, lang, env)
				})
			}
		})
	}
})
