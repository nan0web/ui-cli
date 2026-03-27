// @ts-nocheck
import { ProjectModel } from '@nan0web/core'
import { ask, log, result } from '@nan0web/ui'
import DBFS from '@nan0web/db-fs'
import path from 'node:path'

/**
 * Blueprint: Project Generator (OLMUI Model)
 *
 * Інтерактивно збирає дані з користувача (Model-as-Schema)
 * і генерує project.md та project.yaml у поточній директорії.
 */
export class ProjectBlueprint extends ProjectModel {
	static UI = {
		title: 'NaN0Web Project Blueprint Generator',
		description: 'Interactively collects data to scaffold project.md & project.yaml',
	}

	/**
	 * Run the blueprint interaction flow.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent>}
	 */
	async *run() {
		yield log('info', `🦅 === ${ProjectBlueprint.UI.title} ===`)

		// OLMUI Model-as-Schema: ask will automatically build UI form using ProjectModel
		const projectRes = yield ask('project', ProjectModel)
		const rawData = projectRes?.value ?? projectRes
		
		if (projectRes?.cancelled || !rawData) {
			yield log('warn', 'Cancelled.')
			return
		}

		// DI: data окремо, options окремо
		const project = new ProjectModel(rawData, {})

		if (Array.isArray(project.i18n)) {
			const locales = project.i18n
			project.i18n = {}
			for (const loc of locales) {
				if (loc !== project.locale) {
					project.i18n[loc] = `docs/${loc}/project.md`
				}
			}
		}

		yield log('success', 'Data collected. Generating files...\n')

		const yamlFrontmatter = [
			'---',
			`description: "${project.description}"`,
			`tags: [${(project.tags || []).join(', ')}]`,
			`locale: ${project.locale}`,
			`status: ${project.status}`,
			'i18n:',
			...Object.entries(project.i18n || {}).map(([k, v]) => `  ${k}: ${v}`),
			'---',
		].join('\n')

		const phases = [
			{ icon: '🧭', num: 1, title: 'Philosophy & Abstraction (The Seed)' },
			{ icon: '📐', num: 2, title: 'Domain Modeling (Data-Driven Models)' },
			{ icon: '🛠', num: 3, title: 'Logic Verification (CLI-First)' },
			{ icon: '🪐', num: 4, title: 'Sovereign Workbench (The Master IDE)' },
			{ icon: '🎨', num: 5, title: 'Theming & Interfaces (Theming)' },
			{ icon: '✅', num: 6, title: 'Quality & Distribution (Quality & Distribution)' },
			{ icon: '💎', num: 7, title: 'Value & Economy (Value & Economy)' },
			{ icon: '🌐', num: 8, title: 'Decentralization & Sovereignty (Sovereignty)' },
			{ icon: '🌍', num: 9, title: 'Mission & World Impact (World Impact)' },
		]

		const phaseSections = phases
			.map(
				(p) =>
					`\n## ${p.icon} Phase ${p.num}: ${p.title}\n\n- [ ] TODO: Define tasks for this phase`
			)
			.join('\n')

		const dod = `
## 🏁 Definition of Done

- [ ] Phases 1–9 described with concrete tasks
- [ ] Domain Model implemented (Model-as-Schema)
- [ ] TDD tests passed
- [ ] i18n keys extracted and verified
- [ ] project.yaml synchronized
`

		const mdContent = `${yamlFrontmatter}\n\n# ${project.description || 'New Project'}\n${phaseSections}\n${dod}`
		const yamlData = JSON.stringify(project, null, 2)

		// Create a local DBFS mounted to current working directory
		const cwdDb = new DBFS({ root: process.cwd() })
		await cwdDb.connect()

		// Guard: don't overwrite existing files
		const existingMd = await cwdDb.loadDocument('project.md', null)
		if (existingMd !== null) {
			yield log('error', `！ project.md already exists at ${process.cwd()}/project.md\nUse --force to overwrite (not implemented yet).`)
			return
		}

		await cwdDb.saveDocumentAs('.txt', 'project.md', mdContent)
		yield log('info', `Created: project.md`)

		await cwdDb.saveDocument('project.yaml', JSON.parse(yamlData))
		yield log('info', `Created: project.yaml`)

		yield log('success', `Project "${project.description || 'New'}" is ready!\nNext: fill in phase tasks in project.md`)

		return result({ action: 'blueprint_created', project: project.description })
	}
}

// Support for local standalone execution (e.g., node blueprint/project.js)
import { fileURLToPath } from 'node:url'
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	import('../../index.js').then(async ({ runApp, CLiInputAdapter }) => {
		const { default: Logger } = await import('@nan0web/log')
		const { default: DB } = await import('@nan0web/db')

		const console = new Logger({ level: 'info' })
		const dbConsole = new Logger({ level: 'error' })

		const db = new DB({ console: dbConsole })
		db.mount('', new DBFS({ root: 'data', console: dbConsole }))
		await db.connect()

		const adapter = new CLiInputAdapter({ console, t: (str) => str })

		const model = new ProjectBlueprint()
		await import('../core/GeneratorRunner.js')
			.then(({ runGenerator }) => runGenerator(model, adapter, { db, t: (str) => str }))
			.catch((e) => {
				console.error('Error:', e.message)
				process.exit(1)
			})
	})
}
