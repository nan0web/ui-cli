#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import Logger from '@nan0web/log'
import CLiInputAdapter from '../src/InputAdapter.js'

// Import components
import {
	Alert,
	Badge,
	Toast,
	Table,
	Tabs,
	Breadcrumbs,
	Steps,
	Input,
	Password,
	Toggle,
	Confirm,
	Select,
	Multiselect,
	Slider,
	DateTime,
	Tree,
	Spinner,
	ProgressBar,
} from '../src/index.js'

const console = new Logger({ level: 'info' })
const inputAdapter = new CLiInputAdapter({ console })
const CONFIG_FILE = path.resolve(
	process.cwd(),
	process.env.CLI_SANDBOX_CONFIG || '.cli-sandbox.json'
)

// Helper for Prompts to safely execute and log the value
async function runPrompt(Component, props) {
	try {
		const comp = Component({ ...props, console })
		let res
		if (comp.execute) {
			res = await comp.execute()
		} else {
			console.error('Component is not an interactive Prompt.')
			return
		}

		const val = res && typeof res === 'object' && res.value !== undefined ? res.value : res
		console.success(`Result: ${val}`)
		await inputAdapter.pause('Press any key to continue...')
	} catch (error) {
		if (error && error.message && error.message.toLowerCase().includes('cancel')) {
			console.info('\nCancelled prompt.')
			await inputAdapter.pause('Press any key to continue...')
		} else {
			console.error('Prompt Error:', error)
			await inputAdapter.pause('Press any key to continue...')
		}
	}
}

// Full Sandbox Catalog
const catalog = {
	// --- VIEWS ---
	Alert: {
		render: (props) => Alert(props),
		type: 'view',
		defaultProps: {
			title: 'Attention',
			message: 'This is a sandbox alert preview.',
			variant: 'info',
		},
		schema: [
			{ name: 'title', type: 'text', message: 'Enter alert title:' },
			{ name: 'message', type: 'text', message: 'Enter alert message:' },
			{
				name: 'variant',
				type: 'select',
				message: 'Select variant:',
				choices: ['info', 'success', 'warning', 'error'],
			},
		],
	},
	Badge: {
		render: (props) => Badge(props),
		type: 'view',
		defaultProps: { label: 'New Feature', variant: 'success' },
		schema: [
			{ name: 'label', type: 'text', message: 'Enter badge text:' },
			{
				name: 'variant',
				type: 'select',
				message: 'Select variant:',
				choices: ['neutral', 'info', 'success', 'warning', 'error'],
			},
		],
	},
	Toast: {
		render: (props) => Toast(props),
		type: 'view',
		defaultProps: { message: 'Settings saved successfully.', variant: 'success' },
		schema: [
			{ name: 'message', type: 'text', message: 'Enter toast message:' },
			{
				name: 'variant',
				type: 'select',
				message: 'Select variant:',
				choices: ['info', 'success', 'warning', 'error'],
			},
		],
	},
	Table: {
		render: (props) =>
			Table({
				...props,
				data: [
					{ id: 1, name: 'Alice', role: 'Admin' },
					{ id: 2, name: 'Bob', role: 'User' },
				],
			}),
		type: 'view',
		defaultProps: { interactive: false, title: 'Users Table' },
		schema: [{ name: 'title', type: 'text', message: 'Enter table title:' }],
	},
	Tabs: {
		render: (props) => Tabs({ ...props, items: ['Dashboard', 'Users', 'Settings'] }),
		type: 'view',
		defaultProps: { active: 'Users' },
		schema: [{ name: 'active', type: 'text', message: 'Enter active tab:' }],
	},
	Breadcrumbs: {
		render: (props) => Breadcrumbs({ ...props, items: ['Home', 'App', 'Editor'] }),
		type: 'view',
		defaultProps: {},
		schema: [],
	},
	Steps: {
		render: (props) => Steps({ ...props, items: ['Cart', 'Address', 'Payment'] }),
		type: 'view',
		defaultProps: { current: 1 },
		schema: [{ name: 'current', type: 'text', message: 'Enter current step index (0-based):' }],
	},

	// --- PROMPTS ---
	Input: {
		render: async (props) => runPrompt(Input, props),
		type: 'prompt',
		defaultProps: { message: 'Enter your name:', initial: '' },
		schema: [
			{ name: 'message', type: 'text', message: 'Enter prompt message:' },
			{ name: 'initial', type: 'text', message: 'Enter initial value:' },
		],
	},
	Password: {
		render: async (props) => runPrompt(Password, props),
		type: 'prompt',
		defaultProps: { message: 'Enter your password:' },
		schema: [{ name: 'message', type: 'text', message: 'Enter password message:' }],
	},
	Toggle: {
		render: async (props) => runPrompt(Toggle, props),
		type: 'prompt',
		defaultProps: { message: 'Enable feature?', initial: false },
		schema: [{ name: 'message', type: 'text', message: 'Enter toggle message:' }],
	},
	Confirm: {
		render: async (props) => runPrompt(Confirm, props),
		type: 'prompt',
		defaultProps: { message: 'Are you sure?' },
		schema: [{ name: 'message', type: 'text', message: 'Enter confirm message:' }],
	},
	Select: {
		render: async (props) =>
			runPrompt(Select, { ...props, options: ['Apple', 'Banana', 'Cherry'] }),
		type: 'prompt',
		defaultProps: { title: 'Select a fruit:' },
		schema: [{ name: 'title', type: 'text', message: 'Enter select message:' }],
	},
	Multiselect: {
		render: async (props) =>
			runPrompt(Multiselect, { ...props, options: ['Red', 'Green', 'Blue'] }),
		type: 'prompt',
		defaultProps: { message: 'Select colors:' },
		schema: [{ name: 'message', type: 'text', message: 'Enter multiselect message:' }],
	},
	Slider: {
		render: async (props) =>
			runPrompt(Slider, {
				...props,
				min: Number(props.min),
				max: Number(props.max),
				initial: Number(props.initial),
			}),
		type: 'prompt',
		defaultProps: { message: 'Adjust Volume:', min: 0, max: 100, initial: 50 },
		schema: [
			{ name: 'message', type: 'text', message: 'Enter slider message:' },
			{ name: 'min', type: 'text', message: 'Enter min value:' },
			{ name: 'max', type: 'text', message: 'Enter max value:' },
			{ name: 'initial', type: 'text', message: 'Enter initial value:' },
		],
	},
	DateTime: {
		render: async (props) => runPrompt(DateTime, props),
		type: 'prompt',
		defaultProps: { message: 'Pick a date:' },
		schema: [{ name: 'message', type: 'text', message: 'Enter datetime message:' }],
	},
	Spinner: {
		render: async (props) => {
			const spinner = Spinner({ ...props, console })
			const instance = await spinner.execute()
			await new Promise((r) => setTimeout(r, 2000))
			instance.stop('Done!')
		},
		type: 'prompt', // Special kind of interactive
		defaultProps: { message: 'Loading resources...' },
		schema: [{ name: 'message', type: 'text', message: 'Enter spinner message:' }],
	},
	ProgressBar: {
		render: async (props) => {
			const bar = await ProgressBar({ ...props, console }).execute()
			for (let i = 0; i <= 100; i += 10) {
				bar.update(i)
				await new Promise((r) => setTimeout(r, 100))
			}
		},
		type: 'prompt',
		defaultProps: { title: 'Downloading file:', total: 100 },
		schema: [{ name: 'title', type: 'text', message: 'Enter progress bar title:' }],
	},
}

// Data Manager
function loadConfig() {
	if (fs.existsSync(CONFIG_FILE)) {
		try {
			return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
		} catch (e) {
			console.error('Failed to parse .cli-sandbox.json, resetting to default.', e)
		}
	}
	return {}
}

function saveConfig(data) {
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8')
}

// Initialize variations structure
const store = loadConfig()
for (const compName of Object.keys(catalog)) {
	if (!store[compName]) {
		store[compName] = [
			{ id: 'default', title: 'Default', props: { ...catalog[compName].defaultProps } },
		]
	}
}
saveConfig(store)

async function runSandbox() {
	console.clear()
	console.info(Logger.style(' 🧱 UI-CLI Sandbox ', { bg: Logger.BG_MAGENTA, color: Logger.BLACK }))

	const args = process.argv.slice(2)
	let targetComp = null
	for (const arg of args) {
		if (arg.startsWith('--comp=')) targetComp = arg.split('=')[1]
	}

	if (targetComp) {
		const realComp = Object.keys(catalog).find(k => k.toLowerCase() === targetComp.toLowerCase())
		if (realComp) {
			await editVariant(realComp, 0, true)
			return
		}
	}

	while (true) {
		const compNames = Object.keys(catalog)
		const { value: selectedComp } = await inputAdapter.requestSelect({
			title: 'Select a component to test:',
			options: [...compNames, '← Exit'],
			limit: 15,
		})

		if (!selectedComp || selectedComp === '← Exit') {
			console.success('\nExiting Sandbox. 👋\n')
			break
		}

		await manageComponent(selectedComp)
	}
}

async function manageComponent(compName, isDirect = false) {
	const compDef = catalog[compName]

	while (true) {
		console.clear()
		const variants = store[compName]

		const options = variants.map((v) => `[Variant] ${v.title}`)
		options.push('+ Create New Variant')
		options.push(isDirect ? '← Exit Sandbox' : '← Back to Components')

		const { value: selAction } = await inputAdapter.requestSelect({
			title: `Sandbox > ${compName}. Choose variation:`,
			options: options,
			limit: 15,
		})

		if (!selAction || selAction === '← Back to Components' || selAction === '← Exit Sandbox') {
			if (isDirect) process.exit(0)
			break
		}

		if (selAction === '+ Create New Variant') {
			const { value: varName } = await inputAdapter.requestInput({
				message: 'Enter new variant name:',
			})
			if (varName) {
				const newId = Date.now().toString()
				store[compName].push({
					id: newId,
					title: varName,
					props: { ...compDef.defaultProps },
				})
				saveConfig(store)

				// UX Fix: Navigate directly to the newly created variant
				await editVariant(compName, store[compName].length - 1, isDirect)
			}
			continue
		}

		// Selected a variant
		const varTitle = selAction.replace('[Variant] ', '')
		const variantIndex = variants.findIndex((v) => v.title === varTitle)
		await editVariant(compName, variantIndex, isDirect)
	}
}

async function editVariant(compName, variantIndex, isDirect = false) {
	const compDef = catalog[compName]

	while (true) {
		const variants = store[compName]
		const variant = variants[variantIndex]

		// Fallbacks handling for preview
		const previewProps = {}
		for (const key of Object.keys(compDef.defaultProps)) {
			previewProps[key] =
				variant.props[key] !== undefined && variant.props[key] !== ''
					? variant.props[key]
					: compDef.defaultProps[key]
		}

		console.clear()
		console.info('='.repeat(50))
		console.info(
			Logger.style(` Sandbox: > ${compName} > ${variant.title} < `, { color: Logger.CYAN })
		)
		console.info('='.repeat(50) + '\n')

		// Render Live Preview
		if (compDef.type === 'view') {
			console.info('👀 LIVE PREVIEW:\n')
			const resultStr = compDef.render(previewProps)
			console.info(resultStr)
		} else {
			console.info('⚡ This is a Prompt Component.')
		}

		console.info('\n' + '='.repeat(50))

		// Build actions
		const actions = compDef.schema.map((p) => {
			const val =
				variant.props[p.name] !== undefined ? variant.props[p.name] : compDef.defaultProps[p.name]
			const displayVal =
				String(val).length > 20 ? String(val).substring(0, 17) + '...' : String(val)
			return `> Edit ${p.name} (curr: ${displayVal})`
		})

		if (compDef.type === 'prompt') {
			actions.push('▶ Run Prompt (Test)')
		}

		actions.push('↺ Reset to Defaults')

		if (variant.id !== 'default') {
			actions.push('✖ Delete Variant')
		}

		actions.push(isDirect ? '← Exit Sandbox' : '← Back')

		const { value: action } = await inputAdapter.requestSelect({
			title: 'Variant Options:',
			options: actions,
			limit: 15,
		})

		if (!action || action === '← Back' || action === '← Exit Sandbox') {
			if (action === '← Exit Sandbox') process.exit(0)
			break
		}

		if (action === '▶ Run Prompt (Test)') {
			await compDef.render(previewProps)
			continue
		}

		if (action === '↺ Reset to Defaults') {
			store[compName][variantIndex].props = { ...compDef.defaultProps }
			saveConfig(store)
			continue
		}

		if (action === '✖ Delete Variant') {
			store[compName].splice(variantIndex, 1)
			saveConfig(store)
			break
		}

		// Edit Prop
		const match = action.match(/> Edit (\w+)/)
		if (match) {
			const propName = match[1]
			const propDef = compDef.schema.find((p) => p.name === propName)

			const currentVal =
				variant.props[propName] !== undefined
					? variant.props[propName]
					: compDef.defaultProps[propName]

			if (propDef.type === 'text') {
				const { value: textValue } = await inputAdapter.requestInput({
					message: propDef.message,
					initial: currentVal,
				})
				if (textValue !== undefined && textValue !== null) {
					variant.props[propName] = textValue
					saveConfig(store)
				}
			} else if (propDef.type === 'select') {
				const { value: selValue } = await inputAdapter.requestSelect({
					title: propDef.message,
					options: propDef.choices,
					initial: propDef.choices.findIndex((c) => c === currentVal),
				})
				if (selValue) {
					variant.props[propName] = selValue
					saveConfig(store)
				}
			}
		}
	}
}

// Global Ctrl+C handler
process.on('SIGINT', () => {
	console.info('\n' + Logger.style('Interrupted! 👋', { color: Logger.YELLOW }))
	process.exit(0)
})

runSandbox().catch((err) => {
	if (err && err.message && err.message.toLowerCase().includes('cancel')) {
		console.info('\nExiting Sandbox. 👋\n')
		process.exit(0)
	}
	console.error(err)
	process.exit(1)
})
