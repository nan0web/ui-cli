/**
 * Sandbox IDE Snapshot Tests
 * Runs E2E snapshot coverage for the Component Sandbox IDE (bin/sandbox.js).
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { PlaygroundTest } from '../src/test/index.js'

function normalizeOutput(str) {
	return str
		.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, '')
		.replace(/(\[SPINNER_FRAME\]\n?)+/g, '[SPINNER_ANIMATION]\n')
		.replace(/[\u2800-\u28FF]/g, '*')
		// remove dates/timestamps
		.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '[TIMESTAMP]')
		.trim()
}

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots', 'sandbox-ide')

async function verifySandboxSnapshot(scenarioName, env, locale = 'en') {
	const pt = new PlaygroundTest(
		{ ...process.env, UI_SNAPSHOT: '1', G_LANG: locale, ...env },
		{ includeDebugger: false, feedStdin: true }
	)

	const { stdout, stderr } = await pt.run(['bin/sandbox.js'])

	const combined = stdout + (stderr ? '\n--- STDERR ---\n' + stderr : '')
	// Further scrub the path output
	let actual = normalizeOutput(combined)
	actual = actual.replaceAll(process.cwd(), '[CWD]')
	
	const uiThemesDir = path.resolve(process.cwd(), '../ui/themes')
	actual = actual.replaceAll(uiThemesDir, '[THEMES_DIR]')

	if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
	const snapshotPath = path.join(SNAPSHOT_DIR, `${scenarioName}.${locale}.snap`)

	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(snapshotPath, actual, 'utf8')
		console.log(`Updated snapshot: ${snapshotPath}`)
		return
	}

	if (!fs.existsSync(snapshotPath)) {
		console.warn(`WARN: Snapshot not found. Creating it...`)
		fs.writeFileSync(snapshotPath, actual, 'utf8')
		return
	}

	const expected = fs.readFileSync(snapshotPath, 'utf8')
	try {
		assert.strictEqual(actual, expected)
	} catch (e) {
		console.error(`Mismatch for sandbox-ide/${scenarioName}.${locale}.snap`)
		throw e
	}
}

describe('Sandbox IDE E2E Snapshots', () => {
	const locales = ['en', 'uk']

	for (const locale of locales) {
		it(`matches snapshot for Button theme export (${locale})`, async () => {
			const divider = '|'
			let seq
			if (locale === 'uk') {
				seq = `Button|Текст або вміст всередині кнопки: [Click Me]|Тестова Кнопка|✅ Зберегти і вийти|yaml`
			} else {
				seq = `Button|Text or content inside the button: [Click Me]|Test Button|✅ Save and exit|yaml`
			}

			await verifySandboxSnapshot(
				'button_export',
				{
					PLAY_DEMO_SEQUENCE: seq,
					PLAY_DEMO_DIVIDER: divider,
				},
				locale
			)
		})
	}
})
