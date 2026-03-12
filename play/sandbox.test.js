/**
 * Sandbox Snapshot Tests
 * Runs E2E snapshot coverage for the Component Sandbox.
 */

import { describe, it, after } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { PlaygroundTest } from '../src/test/index.js'

function normalizeOutput(str) {
	return str
		.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, '')
		.replace(/\[\=*\>?-*\] \d+% \[\d{2}:\d{2}( < \d{2}:\d{2})?\]/g, '[PROGRESS_BAR]')
		.replace(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏].*$/gm, '[SPINNER_FRAME]')
		.replace(/📁/g, '[D]')
		.replace(/📄/g, '[F]')
		.replace(/▼/g, 'v')
		.replace(/▶/g, '>')
		.replace(/◉/g, '(x)')
		.replace(/◯/g, '( )')
		.replace(/[\u2800-\u28FF]/g, '*')
		.replace(/(\[SPINNER_FRAME\]\n?)+/g, '[SPINNER_ANIMATION]\n')
		.replace(/\[\d{2}:\d{2}\]/g, '[XX:XX]')
		.replace(/^\s+/, '')
		.trim()
}

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots', 'sandbox')

async function verifySandboxSnapshot(scenarioName, compName, env, locale = 'en') {
	const pt = new PlaygroundTest(
		{ ...process.env, UI_SNAPSHOT: '1', G_LANG: locale, ...env },
		{ includeDebugger: false, feedStdin: true }
	)

	const { stdout, stderr } = await pt.run(['play/sandbox.js'])

	const combined = stdout + (stderr ? '\n--- STDERR ---\n' + stderr : '')
	const actual = normalizeOutput(combined)

	const compDir = path.join(SNAPSHOT_DIR, compName.toLowerCase())
	if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true })
	const snapshotPath = path.join(compDir, `${scenarioName}.${locale}.snap`)

	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(snapshotPath, actual, 'utf8')
		console.log(
			`Updated snapshot: sandbox/${compName.toLowerCase()}/${scenarioName}.${locale}.snap`
		)
		return
	}

	if (!fs.existsSync(snapshotPath)) {
		console.warn(
			`WARN: Snapshot not found: sandbox/${compName.toLowerCase()}/${scenarioName}.${locale}.snap. Creating it...`
		)
		fs.writeFileSync(snapshotPath, actual, 'utf8')
		return
	}

	const expected = fs.readFileSync(snapshotPath, 'utf8')
	try {
		assert.strictEqual(actual, expected)
	} catch (e) {
		console.error(
			`\nSandbox Snapshot mismatch for sandbox/${compName.toLowerCase()}/${scenarioName}.snap!`
		)
		throw e
	}
}

// Config file is unique for tests to start from a clean state
const TEST_CONFIG = '.cli-sandbox.test.json'

const COMPONENTS = {
	view: ['Alert', 'Badge', 'Toast', 'Table', 'Tabs', 'Breadcrumbs', 'Steps'],
	prompt: [
		{ name: 'Input', answer: 'test input' },
		{ name: 'Password', answer: 'secret123' },
		{ name: 'Toggle', answer: 'y' },
		{ name: 'Confirm', answer: 'y' },
		{ name: 'Select', answer: 'Apple' }, // The default options are Apple, Banana, Cherry
		{ name: 'Multiselect', answer: '' }, // just enter to submit empty
		{ name: 'Slider', answer: '' }, // just enter to accept default
		{ name: 'DateTime', answer: '' }, // just enter to accept default
		{ name: 'Tree', answer: '' }, // just enter to submit current node
		{ name: 'Spinner', answer: null }, // No input requested
		{ name: 'ProgressBar', answer: null }, // No input requested
		{ name: 'Sortable', answer: '' }, // just enter
	],
}

describe('Sandbox E2E Snapshots', () => {
	if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })

	const locales = ['en', 'uk']

	for (const locale of locales) {
		for (const comp of COMPONENTS.view) {
			it(`matches snapshot for View Component: ${comp} (${locale})`, async () => {
				const testConfig = `.cli-sandbox.${comp.toLowerCase()}-lifecycle-${locale}-${crypto.randomUUID()}.json`
				if (fs.existsSync(testConfig)) fs.unlinkSync(testConfig)
				
				// Sequence:
				// 1. Select Component
				// 2. Select Default Variant
				// 3. Go Back
				// 4. Create New Variant (Name: TestVar)
				// 5. Reset to Defaults
				// 6. Delete Variant
				// 7. Back to Components
				// 8. Exit
				// For Ukrainian we need the translated sequence keys:
				const divider = '|'
				let seq
				if (locale === 'uk') {
					seq = `${comp}|[Варіант] Default|← Назад|+ Створити Новий Варіант|TestVar|↺ Скинути до Стандартних|✖ Видалити Варіант|← Назад до Компонентів|← Вийти`
				} else {
					seq = `${comp}|[Variant] Default|← Back|+ Create New Variant|TestVar|↺ Reset to Defaults|✖ Delete Variant|← Back to Components|← Exit`
				}

				try {
					await verifySandboxSnapshot(
						'lifecycle',
						comp,
						{
							CLI_SANDBOX_CONFIG: testConfig,
							PLAY_DEMO_SEQUENCE: seq,
							PLAY_DEMO_DIVIDER: divider,
						},
						locale
					)
				} finally {
					if (fs.existsSync(testConfig)) fs.unlinkSync(testConfig)
				}
			})
		}

		for (const p of COMPONENTS.prompt) {
			it(`matches snapshot for Prompt Component: ${p.name} (${locale})`, async () => {
				const testConfig = `.cli-sandbox.${p.name.toLowerCase()}-lifecycle-${locale}-${crypto.randomUUID()}.json`
				if (fs.existsSync(testConfig)) fs.unlinkSync(testConfig)
				
				const divider = '|'
				let seqParams

				if (locale === 'uk') {
					seqParams = `${p.name}|[Варіант] Default|▶ Запустити Інтерактив (Test)`
				} else {
					seqParams = `${p.name}|[Variant] Default|▶ Run Prompt (Test)`
				}

				if (p.answer !== null) {
					seqParams += `${divider}${p.answer}`
				}

				if (locale === 'uk') {
					seqParams += `${divider}← Назад${divider}+ Створити Новий Варіант${divider}TestVar${divider}✖ Видалити Варіант${divider}← Назад до Компонентів${divider}← Вийти`
				} else {
					seqParams += `${divider}← Back${divider}+ Create New Variant${divider}TestVar${divider}✖ Delete Variant${divider}← Back to Components${divider}← Exit`
				}

				try {
					await verifySandboxSnapshot(
						'lifecycle',
						p.name,
						{
							CLI_SANDBOX_CONFIG: testConfig,
							PLAY_DEMO_SEQUENCE: seqParams,
							PLAY_DEMO_DIVIDER: divider,
						},
						locale
					)
				} finally {
					if (fs.existsSync(testConfig)) fs.unlinkSync(testConfig)
				}
			})
		}
	}

	// Clean up config after all tests
	after(() => {
		if (fs.existsSync(TEST_CONFIG)) fs.unlinkSync(TEST_CONFIG)
	})
})
