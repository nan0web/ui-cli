import { DocsParser, DatasetParser } from '@nan0web/test'
import FS from '@nan0web/db-fs'
import { ModelAsApp } from './ModelAsApp.js'

export class ReadmeMd extends ModelAsApp {
	static UI = {
		title: 'Generate README.md Documentation',
		success: 'Documentation generated successfully!',
	}

	static target = {
		default: 'src/README.md.js',
		help: 'Source file to parse docs from (with @docs blocks)',
	}

	static data = {
		default: 'docs',
		help: 'Directory to save generated documentation',
	}

	static root = {
		alias: 'root',
		default: 'README.md',
		help: 'Root index file name',
	}

	/**
	 * @param {Partial<ReadmeMd>} data
	 * @param {import('@nan0web/ui').ModelAsAppOptions} options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Source file to parse docs from (with `@docs` blocks) */ this.target
		/** @type {string} Directory to save generated documentation */ this.data
		/** @type {string} Root index file name */ this.root
	}

	/**
	 * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run(options) {
		const t = this._.t || ((k) => k)
		const db = this._.db || new FS()
		const pkg = await db.loadDocument('package.json', {})

		const parser = new DocsParser()
		const sourceCode = String(await db.loadDocument(this.target))
		const text = String(parser.decode(sourceCode))

		const docsDb = new FS({ root: this.data })
		const doc = await docsDb.fetch('index')
		const availLangs = doc.langs ?? []

		const buildNav = (isRoot = false) =>
			availLangs
				.map((lang) => {
					const { flag, title, locale } = lang
					const prefix = isRoot ? this.data : '..'
					return `[${flag} ${title}](${prefix}/${locale}/${this.root})`
				})
				.join(' | ')

		// Ensure we have a default locale (e.g. 'en')
		const mainLocale = availLangs[0]?.locale || 'en'

		// 1. Save Full Document version in main locale folder
		const fullDoc = text.replace('<!-- %LANGS% -->', buildNav())
		await docsDb.saveDocument(`${mainLocale}/${this.root}`, fullDoc)

		// 2. Save Root (Short) Version
		const license = String(await db.loadDocument('LICENSE'))
		const rootNav = buildNav(true)
		const rootText = [
			`# ${pkg.name}`,
			'',
			rootNav,
			'',
			pkg.description,
			'',
			`[👉 Full Documentation](${this.data}/${mainLocale}/${this.root})`,
			'',
			'## License',
			'',
			`[${license.split('\n').filter(Boolean)[0]}](./LICENSE)`,
		].join('\n')
		await db.saveDocument(this.root, rootText)

		// 3. Extract Datasets for Language Living Model (LLiMo)
		const dataset = DatasetParser.parse(text, pkg.name)
		await db.saveDocument('.datasets/README.dataset.jsonl', dataset)

		yield { type: 'log', message: ReadmeMd.UI.success }
	}
}
