#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, resolve, relative, dirname } from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)
const snapDirArg = args.find((a) => a.startsWith('--dir='))?.split('=')[1] || '__snapshots__'
const outPathArg = args.find((a) => a.startsWith('--out='))?.split('=')[1] || 'CLI_GALLERY.md'
const matchArg = args.find((a) => a.startsWith('--match='))?.split('=')[1] || ''
const skipArg = args.find((a) => a.startsWith('--skip='))?.split('=')[1] || ''

const snapDir = resolve(process.cwd(), snapDirArg)
const outPath = resolve(process.cwd(), outPathArg)

try {
	let files = []
	try {
		const getFiles = (dir) => {
			let results = []
			const list = readdirSync(dir, { withFileTypes: true })
			for (const file of list) {
				const fullPath = join(dir, file.name)
				if (file.isDirectory()) {
					results = results.concat(getFiles(fullPath))
				} else if (file.name !== 'index.md') {
					results.push(relative(snapDir, fullPath))
				}
			}
			return results
		}

		files = getFiles(snapDir).filter(
			(f) =>
				f.endsWith('.txt') ||
				f.endsWith('.snap') ||
				f.endsWith('.md') ||
				f.endsWith('.json') ||
				f.endsWith('.jsonl') ||
				f.endsWith('.yaml') ||
				f.endsWith('.yml') ||
				f.endsWith('.log') ||
				f.endsWith('.webp') ||
				f.endsWith('.png') ||
				f.endsWith('.jpg')
		)

		if (matchArg) files = files.filter((f) => f.includes(matchArg))
		if (skipArg) files = files.filter((f) => !f.includes(skipArg))
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.error(`❌ Directory not found: ${snapDir}`)
			process.exit(1)
		}
		throw e
	}

	if (files.length === 0) {
		console.error(`❌ No snapshots found in: ${snapDir}`)
		writeFileSync(outPath, '# Галерея порожня\n\nНе знайдено сніпшотів за цим фільтром.', 'utf8')
		process.exit(0)
	}

	// Sort files by name (ascending)
	files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

	let md = `# Галерея Інтерфейсів (Snapshots Gallery)\n\n`
	md += `Цей файл генерується автоматично. Тут зібрані всі еталонні зліпки екранів.\n`
	md += `**Як коментувати:** Пишіть коментарі під будь-яким екраном (розділ 💬 Коментарі), і розробник/ШІ їх врахує.\n\n`
	md += `---\n\n`

	for (const file of files) {
		const isImage = file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg')
		// Clean up the filename for display (e.g. form/form_valid.en.snap -> Form: Form Valid En)
		const cleanName = file.replace(/\.(txt|snap|md|json|jsonl|yaml|yml|log|webp|png|jpg)$/, '')
		const parts = cleanName.split(/[_\/\.\-]/).filter(Boolean)

		let stepNumber = ''
		// If last segment is a number, it's our frame number
		if (!isNaN(parts[parts.length - 1])) {
			stepNumber = parts.pop()
		} else if (!isNaN(parts[0])) {
			// Fallback for old prefixed format just in case
			stepNumber = parts.shift()
		}

		// Ensure unique words in title
		const uniqueParts = [...new Set(parts)]
		const title = uniqueParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
		const finalTitle = stepNumber ? `${title} (Крок ${stepNumber})` : title

		md += `## 🖥 Екран: \`${finalTitle}\` (\`${file}\`)\n\n`

		if (isImage) {
			const relPath = relative(dirname(outPath), join(snapDir, file))
			md += `![${finalTitle}](${relPath})\n\n`
		} else {
			const content = readFileSync(join(snapDir, file), 'utf8')
			// Auto-detect syntax
			let syntax = 'text'
			if (file.endsWith('.html') || content.trim().startsWith('<')) syntax = 'html'
			else if (file.endsWith('.json') || file.endsWith('.jsonl')) syntax = 'json'
			else if (file.endsWith('.yaml') || file.endsWith('.yml')) syntax = 'yaml'
			else if (file.endsWith('.log'))
				syntax = 'ansi' // Або просто text для логів
			else if (content.includes('>>') || content.includes('{')) syntax = 'javascript'
			else if (file.endsWith('.md')) syntax = 'markdown'

			md += `\`\`\`${syntax}\n${content.trim()}\n\`\`\`\n\n`
		}

		md += `> **💬 Коментарі щодо ${finalTitle}:**\n> *(напишіть тут що змінити: кольори, відступи, тексти, логіку)*\n\n`
		md += `---\n\n`
	}

	writeFileSync(outPath, md, 'utf8')
	console.log(`✅ Gallery generated successfully at: ${outPathArg}`)
} catch (err) {
	console.error(`❌ Failed to generate gallery: ${err.message}`)
	process.exit(1)
}
