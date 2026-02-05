
import { render } from '../src/core/render.js';
import getT from './vocabs/index.js';
import { Alert } from '../src/components/view/Alert.js';
import { Badge } from '../src/components/view/Badge.js';
import { Toast } from '../src/components/view/Toast.js';
import { Table } from '../src/components/view/Table.js';
import { Breadcrumbs, Tabs, Steps } from '../src/components/view/Nav.js';

import { Input } from '../src/components/prompt/Input.js';
import { Password } from '../src/components/prompt/Password.js';
import { Confirm } from '../src/components/prompt/Confirm.js';
import { Toggle } from '../src/components/prompt/Toggle.js';
import { Select } from '../src/components/prompt/Select.js';
import { Multiselect } from '../src/components/prompt/Multiselect.js';
import { Autocomplete } from '../src/components/prompt/Autocomplete.js';
import { Slider } from '../src/components/prompt/Slider.js';
import { Mask } from '../src/components/prompt/Mask.js';
import { DateTime } from '../src/components/prompt/DateTime.js';
import { Tree } from '../src/components/prompt/Tree.js';
import { ProgressBar } from '../src/components/prompt/ProgressBar.js';
import { Spinner } from '../src/components/prompt/Spinner.js';
import { Pause } from '../src/components/prompt/Pause.js';
import { Next } from '../src/components/prompt/Next.js';

/**
 * Runs the Comprehensive V2 Component Demo.
 * @param {import('@nan0web/log').default} console
 * @param {Function} t
 */
async function runShowcase(console, t) {
	console.info(t('--- V2 Components Showcase ---'));

	// 1. Static Content & Feedback
	console.log(Alert({
		title: t('V2 Architecture Showcase'),
		children: t('Demonstrating 100% of functional components in the new renderer engine.'),
		variant: 'info'
	}));

	console.log(Badge({ label: t('MODULAR'), variant: 'success' }), Badge({ label: t('DEPENDENCY-FREE'), variant: 'info' }));

	console.log(Toast({ message: t('Engine initialized'), variant: 'success' }));
	console.log(Toast({ message: t('Snapshot mode active'), variant: 'info' }));

	// 2. Indicators
	const bar = await render(ProgressBar({ total: 10, message: t('Initializing components...') }));
	for (let i = 1; i <= 10; i++) {
		bar.update(i);
		await render(Pause({ ms: 20 }));
	}

	await render(Spinner({
		message: t('Checking system state...'),
		action: new Promise(r => setTimeout(r, 300)), // Pure promise for action
		successMessage: t('System Ready')
	}));

	// 3. Navigation Views
	console.info('\n' + t('Navigation Views:'));
	console.log(Breadcrumbs(['Home', 'NanoWeb', 'UI-CLI', 'V2-Demo']));
	console.log(Tabs({ items: ['Settings', 'Profile', 'Security'], active: 'Profile' }));
	console.log(Steps({ items: ['Plan', 'Build', 'Verify'], current: 1 }));

	// 4. Data Visualization
	console.info('\n' + t('Data Views (Static Table):'));
	await render(Table({
		title: t('Component Registry'),
		interactive: false,
		data: [
			{ component: 'Prompt', type: 'Interactive', status: 'Stable' },
			{ component: 'View', type: 'Static', status: 'LTS' },
			{ component: 'Nav', type: 'Recursive', status: 'Alpha' }
		]
	}));

	// 5. Basic Input Prompts
	console.info('\n' + t('Interactive Phase 1: Identity'));
	const name = await render(Input({ message: t('Enter username:'), initial: 'UserV2' }));
	const pass = await render(Password({ message: t('Enter secret key:'), initial: '12345' }));
	const isReady = await render(Toggle({
		message: t('Enable telemetry:'),
		initial: true,
		active: t('yes'),
		inactive: t('no')
	}));
	const confirmed = await render(Confirm({ message: t('Confirm deployment?'), initial: true, t }));

	// 6. Advanced Selection
	console.info('\n' + t('Interactive Phase 2: Configuration'));
	const category = await render(Select({
		message: t('Select environment:'),
		options: [
			{ title: t('Production'), value: 'prod' },
			{ title: t('Staging'), value: 'stage' },
			{ title: t('Development'), value: 'dev' }
		],
		t
	}));

	const features = await render(Multiselect({
		message: t('Select features to enable:'),
		options: [
			{ title: t('Logging'), value: 'logs', selected: true },
			{ title: t('Caching'), value: 'cache' },
			{ title: t('Metrics'), value: 'stats' }
		],
		t
	}));

	const country = await render(Autocomplete({
		message: t('Enter country:'),
		options: [t('Ukraine'), t('Germany'), t('USA'), t('France'), t('Japan')],
		initial: t('Ukraine'),
		t
	}));

	// 7. Value Control & Formatting
	console.info('\n' + t('Interactive Phase 3: Parameters'));
	const cpu = await render(Slider({ message: t('CPU Limit (%)'), min: 0, max: 100, initial: 75, t }));
	const phone = await render(Mask({ message: t('Contact Phone:'), mask: '+38 (###) ###-##-##', placeholder: '0671234567' }));
	const deployDate = await render(DateTime({ message: t('Deploy Date:'), mode: 'date', initial: '2026-02-07' }));

	// 8. Complex Selection
	console.info('\n' + t('Interactive Phase 4: File System'));

	// Mock file system tree for demonstration
	const mockFileTree = [
		{
			name: 'src',
			value: 'src',
			children: [
				{ name: 'index.js', value: 'src/index.js' },
				{
					name: 'components', value: 'src/components', children: [
						{ name: 'Button.js', value: 'src/components/Button.js' },
						{ name: 'Input.js', value: 'src/components/Input.js' }
					]
				},
				{
					name: 'utils', value: 'src/utils', children: [
						{ name: 'helpers.js', value: 'src/utils/helpers.js' }
					]
				}
			]
		},
		{
			name: 'package.json',
			value: 'package.json'
		},
		{
			name: 'README.md',
			value: 'README.md'
		},
		{
			name: 'dist',
			value: 'dist',
			children: [
				{ name: 'bundle.js', value: 'dist/bundle.js' },
				{ name: 'bundle.css', value: 'dist/bundle.css' }
			]
		}
	];

	const targetFile = await render(Tree({
		message: t('Select deploy target:'),
		tree: mockFileTree,
		initial: 'package.json',
		t
	}));

	// 9. Summary
	console.log(Alert({
		title: t('Setup Complete'),
		children: [
			`${t('User')}: ${name || 'N/A'}`,
			`${t('Env')}: ${category || 'N/A'}`,
			`${t('Country')}: ${country || 'N/A'}`,
			`${t('CPU')}: ${cpu ?? 0}%`,
			`${t('Target')}: ${targetFile || 'N/A'}`,
			`${t('Features')}: ${Array.isArray(features) ? features.join(', ') : (features || 'None')}`
		].join('\n'),
		variant: 'success'
	}));

	// 10. Exit Flow
	await render(Pause({ ms: 200 }));
	await render(Next({ message: t('Press any key to finish demonstration...') }));

}

export async function runV2Demo(console, t) {
	await runShowcase(console, t);
}

