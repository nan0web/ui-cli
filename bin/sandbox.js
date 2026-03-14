#!/usr/bin/env node
/**
 * NaN0Web UI-CLI Sandbox IDE
 * 
 * Runs the SandboxModel through the CLI adapter,
 * allowing interactive component inspection and theme export.
 * 
 * Usage: node bin/sandbox.js
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uiPkg = resolve(__dirname, '../../ui/src')

// Dynamic imports to resolve from workspace (bypasses npm registry copy)
const { SandboxModel } = await import(resolve(uiPkg, 'domain/SandboxModel.js'))
const { runGenerator } = await import(resolve(uiPkg, 'core/GeneratorRunner.js'))
const ComponentModels = await import(resolve(uiPkg, 'domain/components/index.js'))

const { default: CLiInputAdapter } = await import('../src/InputAdapter.js')

async function runSandbox() {
	const adapter = new CLiInputAdapter()

	// Extract all export names as registry values (Filter '...Model' classes only)
	const modelNames = Object.keys(ComponentModels)
		.filter(name => name.endsWith('Model') && name !== 'SandboxModel' && name !== 'ShowcaseAppModel' && name !== 'IntentErrorModel')
		.map(name => name.replace('Model', ''))
		
	const sandbox = new SandboxModel({ 
		components: modelNames
	})

	try {
		console.log('\n=======================================')
		console.log('🏖  NaN0Web UI-CLI Sandbox IDE')
		console.log('=======================================\n')

		const result = await runGenerator(sandbox.run(), {
			ask: (intent) => adapter.askIntent(intent),
			log: (intent) => adapter.logIntent(intent),
			progress: (intent) => adapter.progressIntent(intent),
			result: async (intent) => {
				console.log('\n🎉 Finished Sandbox workflow:')
				console.dir(intent.data, { depth: null })
			}
		})

		if (result && result.themeConfig) {
			const fs = await import('node:fs')
			const yaml = await import('js-yaml')
			
			const componentDir = resolve(uiPkg, '../themes', result.targetComponent.toLowerCase())
			if (!fs.existsSync(componentDir)) {
				fs.mkdirSync(componentDir, { recursive: true })
			}

			// Sanitize object before export
			const payload = {
				component: result.targetComponent,
				timestamp: new Date().toISOString(),
				theme: JSON.parse(JSON.stringify(result.themeConfig))
			}

			if (result.exportFormat === 'yaml') {
				const ymlContent = yaml.dump(payload, { indent: 2 })
				fs.writeFileSync(resolve(componentDir, 'theme.yaml'), ymlContent)
				console.log(`\n💾 Saved: ${resolve(componentDir, 'theme.yaml')}`)
			} else if (result.exportFormat === 'json') {
				fs.writeFileSync(resolve(componentDir, 'theme.json'), JSON.stringify(payload, null, 2))
				console.log(`\n💾 Saved: ${resolve(componentDir, 'theme.json')}`)
			} else if (result.exportFormat === 'css') {
				const cssLines = [`/* ${result.targetComponent} Theme */`, ':root {']
				for (const [k, v] of Object.entries(payload.theme)) {
					if (v !== undefined && v !== null && v !== '') {
						cssLines.push(`  --ui-${result.targetComponent.toLowerCase()}-${k}: ${String(v)};`)
					}
				}
				cssLines.push('}')
				fs.writeFileSync(resolve(componentDir, 'theme.css'), cssLines.join('\n'))
				console.log(`\n💾 Saved: ${resolve(componentDir, 'theme.css')}`)
			}
		}

		return result
	} catch (error) {
		if (error.code === 'aborted' || error.name === 'CancelError') {
			console.log('\n❌ Sandbox closed by user.')
			return
		}
		console.error('\n🚨 Sandbox Error:', error)
	}
}

runSandbox()
