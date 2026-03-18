/**
 * SandboxApp — OLMUI-driven Component Sandbox.
 *
 * A pure Model that enumerates all ui-cli components,
 * lets the user pick one and tune its attributes via renderForm (Object Map).
 *
 * Demonstrates nested generator yield* delegation.
 */
import { ask, log, progress } from '../../../ui/src/core/Intent.js'

// ─── Component Models (each is a tiny Model-as-Schema) ───

class AlertModel {
	static UI = {
		title: 'Alert Component',
		description: 'Shows an alert box',
	}
	static title   = { help: 'Alert title',   default: 'Heads up!' }
	static message = { help: 'Alert message', default: 'Something important happened.' }
	static variant = {
		help: 'Variant',
		default: 'info',
		options: [
			{ value: 'info',    label: 'ℹ️ Info' },
			{ value: 'success', label: '✅ Success' },
			{ value: 'warning', label: '⚠️ Warning' },
			{ value: 'error',   label: '🚨 Error' },
		],
	}
}

class BadgeModel {
	static UI = {
		title: 'Badge Component',
		description: 'Shows a small badge',
	}
	static label   = { help: 'Badge text',  default: 'New' }
	static variant = {
		help: 'Variant',
		default: 'info',
		options: [
			{ value: 'neutral', label: '⬜ Neutral' },
			{ value: 'info',    label: 'ℹ️ Info' },
			{ value: 'success', label: '✅ Success' },
			{ value: 'warning', label: '⚠️ Warning' },
			{ value: 'error',   label: '🚨 Error' },
		],
	}
}

class InputModel {
	static UI = {
		title: 'Input Prompt',
		description: 'Shows a text input',
	}
	static message     = { help: 'Prompt message', default: 'Enter your name:' }
	static placeholder = { help: 'Placeholder',    default: 'John Doe' }
}

class SelectModel {
	static UI = {
		title: 'Select Prompt',
		description: 'Shows a single choice list',
	}
	static message = { help: 'Prompt message', default: 'Pick a fruit:' }
	static option1 = { help: 'Option 1', default: 'Apple' }
	static option2 = { help: 'Option 2', default: 'Banana' }
	static option3 = { help: 'Option 3', default: 'Cherry' }
}

class SliderModel {
	static UI = {
		title: 'Slider Prompt',
		description: 'Shows a numeric slider',
	}
	static message = { help: 'Prompt message', default: 'Set volume:' }
	static min     = { help: 'Minimum', default: 0, type: 'number' }
	static max     = { help: 'Maximum', default: 100, type: 'number' }
	static initial = { help: 'Initial', default: 50, type: 'number' }
}

class ToggleModel {
	static UI = {
		title: 'Toggle Prompt',
		description: 'Shows a toggle switch',
	}
	static message  = { help: 'Prompt message', default: 'Enable dark mode?' }
	static active   = { help: 'Active label',   default: 'Yes' }
	static inactive = { help: 'Inactive label', default: 'No' }
}

class SpinnerModel {
	static UI = {
		title: 'Spinner / Progress',
		description: 'Shows a loading spinner',
	}
	static message  = { help: 'Spinner message',  default: 'Loading resources...' }
	static duration = { help: 'Duration (sec)', default: 2, type: 'number', hint: 'slider', min: 1, max: 10 }
}

class MultiselectModel {
	static UI = {
		title: 'Multiselect Prompt',
		description: 'Shows a multiple choice list',
	}
	static message = { help: 'Prompt message', default: 'Select tags:' }
	static options = { help: 'Comma-separated options', default: 'Node.js, Lit, React, Swift, Kotlin' }
}

class FilePickerModel {
	static UI = {
		title: 'File Picker',
		description: 'Shows a file browser',
	}
	static message = { help: 'Prompt message', default: 'Pick a source file:' }
	static root    = { help: 'Root directory', default: '.' }
	static hidden  = { help: 'Show hidden', default: false, type: 'boolean' }
}

class TableModel {
	static UI = {
		title: 'Table Component',
		description: 'Shows a data table',
	}
	static title = { help: 'Table Title', default: 'Inventory' }
	static col1  = { help: 'Column 1 Name', default: 'Item' }
	static col2  = { help: 'Column 2 Name', default: 'Qty' }
}

class SortableModel {
	static UI = {
		title: 'Sortable Prompt',
		description: 'Shows a sortable list',
	}
	static message = { help: 'Prompt message', default: 'Prioritize tasks:' }
	static items   = { help: 'Comma-separated items', default: 'Task A, Task B, Task C' }
}

class TreeModel {
	static UI = {
		title: 'Tree Selection',
		description: 'Shows a hierarchical tree',
	}
	static message = { help: 'Prompt message', default: 'Select a file:' }
	static depth   = { help: 'Tree depth', default: 2, type: 'number' }
}

// ─── Component Catalog ───

const CATALOG = {
	Alert:   { model: AlertModel,   type: 'view' },
	Badge:   { model: BadgeModel,   type: 'view' },
	Input:   { model: InputModel,   type: 'prompt' },
	Select:  { model: SelectModel,  type: 'prompt' },
	Slider:  { model: SliderModel,  type: 'prompt' },
	Toggle:  { model: ToggleModel,  type: 'prompt' },
	Spinner: { model: SpinnerModel, type: 'prompt' },
	Multiselect: { model: MultiselectModel, type: 'prompt' },
	FilePicker:  { model: FilePickerModel,  type: 'prompt' },
	Table:   { model: TableModel,   type: 'view' },
	Sortable: { model: SortableModel, type: 'prompt' },
	Tree:    { model: TreeModel,    type: 'prompt' },
}

// ─── SandboxApp Model ───

export default class SandboxApp {

	static UI = {
		title: '🧱 Component Sandbox',
		description: 'Explore and configure UI-CLI components',
	}

	static component = {
		help: 'Select component to explore',
		default: '',
		options: [
			...Object.keys(CATALOG).map(name => ({
				value: name,
				label: `[${name[0].toUpperCase()}] ${CATALOG[name].type === 'view' ? '👁' : '⚡'} ${name}`,
			})),
			{ value: '_back', label: '[X] ← Back to main menu' },
		],
		hotkeys: true,
	}

	static sandbox_action = {
		help: 'What to do?',
		default: '',
		options: [
			{ value: 'configure', label: '[C] ⚙️  Configure attributes' },
			{ value: 'preview',   label: '[P] 👀 Preview component' },
			{ value: 'back',      label: '[B] ← Back to component list' },
		],
		hotkeys: true,
	}

	async *run() {
		yield log('info', SandboxApp.UI.title)
		yield log('info', SandboxApp.UI.description)

		while (true) {
			const compRes = yield ask('component', SandboxApp.component)
			const compName = compRes?.value
			if (compName === '_back' || !compName) return

			const entry = CATALOG[compName]
			if (!entry) continue

			yield* this.#componentFlow(compName, entry)
		}
	}

	async *#componentFlow(compName, entry) {
		yield log('info', `🧩 ${compName} (${entry.type})`)

		// Create a live instance of the component model for attribute editing
		const instance = new entry.model()

		// Initialize defaults from static schema
		for (const [key, meta] of Object.entries(entry.model)) {
			if (meta && typeof meta === 'object' && 'default' in meta && key !== 'UI') {
				instance[key] = meta.default
			}
		}

		while (true) {
			const actionRes = yield ask('sandbox_action', SandboxApp.sandbox_action)
			const action = actionRes?.value

			if (action === 'back' || !action) return

			if (action === 'configure') {
				// Build a dynamic Model class with current instance values as defaults
				// isModelSchema() requires typeof === 'function', plain objects won't work
				class DynamicModel {}
				Object.defineProperty(DynamicModel, 'name', { value: `${compName}Model` })
				DynamicModel.UI = entry.model.UI
				for (const [key, meta] of Object.entries(entry.model)) {
					if (meta && typeof meta === 'object' && 'help' in meta && key !== 'UI') {
						DynamicModel[key] = { ...meta, default: instance[key] ?? meta.default }
					}
				}

				// Yield Model-as-Schema form — the adapter renders Object Map Editor
				const formData = yield ask(compName, DynamicModel)
				if (formData) {
					// Update instance with edited values
					for (const [key, val] of Object.entries(formData)) {
						instance[key] = val
					}
				}
			}

			if (action === 'preview') {
				if (entry.type === 'view') {
					yield log('info', `\n─ ${compName} ─`)
					// Show all current attribute values
					for (const [key, meta] of Object.entries(entry.model)) {
						if (meta && typeof meta === 'object' && 'help' in meta && key !== 'UI') {
							const val = instance[key] ?? meta.default
							yield log('info', `  ${key}: ${JSON.stringify(val)}`)
						}
					}
					yield log('info', '─'.repeat(compName.length + 4) + '\n')
				} else if (entry.type === 'prompt') {
					const schema = {
						help: instance.message || instance.title || `${compName} Preview`,
						default: instance.initial || '',
					}

					if (compName === 'Slider') {
						schema.hint = 'slider'
						schema.type = 'number'
						schema.min = instance.min
						schema.max = instance.max
						schema.default = instance.initial
					} else if (compName === 'Toggle') {
                        schema.hint = 'toggle'
                        schema.type = 'boolean'
                        schema.default = instance.initial
                        schema.active = instance.active
                        schema.inactive = instance.inactive
                    } else if (compName === 'Select') {
						schema.hint = 'select'
						schema.options = [instance.option1, instance.option2, instance.option3]
							.filter(Boolean)
							.map(v => ({ value: v, label: v }))
						schema.default = schema.options[0]?.value
					} else if (compName === 'Input') {
						schema.hint = 'text'
						schema.default = instance.placeholder
					} else if (compName === 'Multiselect') {
						schema.hint = 'multiselect'
						schema.options = (instance.options || '').split(',').map(v => v.trim()).filter(Boolean)
						schema.default = []
					} else if (compName === 'FilePicker') {
						schema.hint = 'file'
						schema.root = instance.root
						schema.showHidden = instance.hidden
					} else if (compName === 'Sortable') {
						schema.hint = 'sortable'
						schema.options = (instance.items || '').split(',').map(v => v.trim()).filter(Boolean)
						schema.default = schema.options
					} else if (compName === 'Tree') {
						schema.hint = 'tree'
						schema.options = [
							{ value: 'src', label: '📁 src', children: [
								{ value: 'src/ui', label: '📁 ui', children: [
									{ value: 'src/ui/slider.js', label: '📄 slider.js' },
									{ value: 'src/ui/table.js', label: '📄 table.js' },
								]},
								{ value: 'src/index.js', label: '📄 index.js' }
							]},
							{ value: 'README.md', label: '📄 README.md' }
						]
						schema.default = 'src/ui/slider.js'
					} 

					if (compName === 'Spinner') {
						yield progress(instance.message || 'Loading...')
					} else if (compName === 'Table') {
						const { table } = await import('../../../ui/src/ui/table.js')
						await table({
							title: instance.title,
							columns: [instance.col1, instance.col2],
							rows: [
								['Apple', '10'],
								['Banana', '25'],
								['Cherry', '7'],
							]
						})
					} else {
					    const result = yield ask('preview_mode', schema)
					    yield log('success', `Result: ${JSON.stringify(result)}`)
                    }
				}
			}
		}
	}
}
