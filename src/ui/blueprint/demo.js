#!/usr/bin/env node

/**
 * Blueprint: Model-as-Schema + resolvePositionalArgs Demo
 *
 * Демонструє як resolvePositionalArgs та generateForm працюють
 * зі СПРАВЖНІМИ доменними моделями екосистеми nan.web.
 *
 * Usage:
 *   node blueprint/demo.js                                    # Interactive (select model)
 *   node blueprint/demo.js project                            # ProjectModel form
 *   node blueprint/demo.js watcher https://example.com/index   # Positional → url
 */

import { generateForm, Form, resolvePositionalArgs } from '../../index.js'
import { ProjectModel } from '@nan0web/core'

let CatalogWatcherModel
try {
	const m = await import(`${'../../catalog-watch/src/domain/CatalogWatcherModel.js'}`)
	CatalogWatcherModel = m.CatalogWatcherModel
} catch {
	// catalog-watch may not be installed — skip
}

// ─── REGISTRY of real ecosystem models ──────────────────

const models = {
	project: {
		Model: ProjectModel,
		label: '📦 ProjectModel',
		desc: '@nan0web/core — project.md schema',
	},
}

if (CatalogWatcherModel) {
	models.watcher = {
		Model: CatalogWatcherModel,
		label: '👁  CatalogWatcherModel',
		desc: '@nan0web/catalog-watch — catalog subscription',
	}
}

// ─── MAIN ───────────────────────────────────────────────

async function run() {
	const args = process.argv.slice(2)
	let modelKey = args.find((a) => !a.startsWith('-'))
	const positionals = args.filter((a) => !a.startsWith('-')).slice(1)

	console.log('\n🦅 === Model-as-Schema CLI Demo ===')
	console.log('    resolvePositionalArgs + generateForm\n')

	// 1. Select model (interactive or positional)
	if (!modelKey || !models[modelKey]) {
		console.log('Available models:\n')
		for (const [key, m] of Object.entries(models)) {
			console.log(`  ${m.label.padEnd(30)} ${key.padEnd(10)} (${m.desc})`)
		}

		const { createInterface } = await import('node:readline')
		const rl = createInterface({ input: process.stdin, output: process.stdout })
		modelKey = await new Promise((resolve) => {
			rl.question('\nSelect model: ', (ans) => {
				rl.close()
				resolve(ans.trim().toLowerCase())
			})
		})

		if (!models[modelKey]) {
			console.error(`\n❌ Unknown model: "${modelKey}"`)
			console.error(`   Available: ${Object.keys(models).join(', ')}`)
			process.exit(1)
		}
	}

	const { Model, label, desc } = models[modelKey]
	console.log(`\n${label} — ${desc}\n${'─'.repeat(50)}`)

	// 2. Resolve positional args FIRST
	const preData = resolvePositionalArgs(Model, positionals)
	const hasPositionals = Object.keys(preData).length > 0

	if (hasPositionals) {
		console.log('\n📎 Positional args resolved:')
		for (const [k, v] of Object.entries(preData)) {
			const schema = Model[k]
			console.log(`   ${schema?.help || k}: ${v}`)
		}
	}

	// 3. Generate form (UiForm) for the model
	const uiForm = generateForm(Model)

	// Filter out already-resolved positional fields from the form
	uiForm.fields = uiForm.fields.filter((f) => preData[f.name] === undefined)

	let formData = {}
	if (uiForm.fields.length > 0) {
		console.log(`\n📝 Fill remaining ${uiForm.fields.length} field(s):\n`)
		const form = new Form(uiForm, { t: (v) => v })
		const { cancelled } = await form.requireInput()
		if (cancelled) {
			console.log('\n⚪ Cancelled.')
			process.exit(0)
		}
		formData = form.body
	}

	// 4. Merge: positional + form data
	const finalData = { ...preData, ...formData }

	// 5. Output
	console.log(`\n${'─'.repeat(50)}`)
	console.log('📦 Result:\n')
	for (const [k, v] of Object.entries(finalData)) {
		const schema = Model[k]
		const label = schema?.help || k
		console.log(`  ${label.padEnd(35)} ${JSON.stringify(v)}`)
	}
	console.log()
}

run().catch((e) => {
	console.error('Error:', e.message)
	process.exit(1)
})
