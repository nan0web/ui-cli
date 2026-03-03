/**
 * @fileoverview Build script for the xterm Docs Site.
 * Copies the `site-docs` static files and all required `.snap`
 * files into a single deployable `dist-docs` directory.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE_SRC = path.join(ROOT, 'site-docs')
const SNAPSHOTS_SRC = path.join(ROOT, 'snapshots')
const DIST = path.join(ROOT, 'dist-docs')

async function buildDocs() {
	console.log('🧱 Building ui-cli documentation site...')

	// 1. Clean and create output directory
	await fs.rm(DIST, { recursive: true, force: true })
	await fs.mkdir(DIST, { recursive: true })

	// 2. Copy static site assets
	console.log('📋 Copying HTML/CSS/JS...')
	const siteFiles = await fs.readdir(SITE_SRC)
	let fileCount = 0
	for (const file of siteFiles) {
		const srcPath = path.join(SITE_SRC, file)
		const stat = await fs.stat(srcPath)
		if (stat.isFile()) {
			const destPath = path.join(DIST, file)

			// Process files if necessary, or just copy
			if (file === 'app.js') {
				let content = await fs.readFile(srcPath, 'utf8')
				// Automatically re-route snapshot directory for deployment
				content = content.replace(
					/const SNAPSHOT_BASE = '\.\.\/snapshots'/,
					"const SNAPSHOT_BASE = 'snapshots'"
				)
				await fs.writeFile(destPath, content)
			} else {
				await fs.copyFile(srcPath, destPath)
			}
			fileCount++
		}
	}
	console.log(`   ✓ Copied ${fileCount} static files.`)

	// 3. Copy snapshots
	console.log('📸 Resolving and copying .snap files...')
	const distSnapshots = path.join(DIST, 'snapshots')
	await fs.mkdir(distSnapshots, { recursive: true })

	let snapCount = 0

	async function copySnapshotsRecursive(dir, outDir) {
		const entries = await fs.readdir(dir, { withFileTypes: true })
		for (const entry of entries) {
			const src = path.join(dir, entry.name)
			const out = path.join(outDir, entry.name)

			if (entry.isDirectory()) {
				await fs.mkdir(out, { recursive: true })
				await copySnapshotsRecursive(src, out)
			} else if (entry.isFile() && entry.name.endsWith('.snap')) {
				await fs.copyFile(src, out)
				snapCount++
			}
		}
	}

	await copySnapshotsRecursive(SNAPSHOTS_SRC, distSnapshots)
	console.log(`   ✓ Copied ${snapCount} snapshot files.`)

	// 4. Finished
	console.log('\n✅ Build complete! Documentation ready for deployment in /dist-docs')
	console.log(`   Command to test locally: npx serve ${path.relative(process.cwd(), DIST)}`)
}

buildDocs().catch((err) => {
	console.error('❌ Build failed:', err)
	process.exit(1)
})
