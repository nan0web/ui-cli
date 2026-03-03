/**
 * @fileoverview nan•web UI-CLI Documentation — Application Logic
 * Loads .snap files, renders xterm.js terminals, manages modal viewer.
 * Zero server dependency — all data comes from static snapshot files.
 */

import { Terminal } from 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm'
import { FitAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/+esm'

// ============================================================
// Configuration
// ============================================================

const SNAPSHOT_BASE = 'snapshots'

/** Component registry with icons and metadata */
const PLAY_COMPONENTS = [
	{ id: 'select', name: 'Select', icon: '📋', type: 'prompt', locales: ['en', 'uk'] },
	{
		id: 'form_valid',
		name: 'Form (Valid)',
		icon: '📝',
		type: 'prompt',
		dir: 'form',
		locales: ['en', 'uk'],
	},
	{
		id: 'form_validation_error',
		name: 'Form (Errors)',
		icon: '⚠️',
		type: 'prompt',
		dir: 'form',
		locales: ['en', 'uk'],
	},
	{
		id: 'view_components',
		name: 'Views',
		icon: '👁️',
		type: 'view',
		dir: 'view',
		locales: ['en', 'uk'],
	},
	{
		id: 'nav_components',
		name: 'Navigation',
		icon: '🧭',
		type: 'view',
		dir: 'nav',
		locales: ['en', 'uk'],
	},
	{
		id: 'tree_view',
		name: 'Tree View',
		icon: '🌳',
		type: 'prompt',
		dir: 'tree',
		locales: ['en', 'uk'],
	},
	{
		id: 'tree_search',
		name: 'Tree Search',
		icon: '🔍',
		type: 'prompt',
		dir: 'tree',
		locales: ['en', 'uk'],
	},
	{
		id: 'autocomplete',
		name: 'Autocomplete',
		icon: '⚡',
		type: 'prompt',
		frames: 3,
		locales: ['en', 'uk'],
	},
	{
		id: 'advanced_form',
		name: 'Advanced Form',
		icon: '🔐',
		type: 'prompt',
		dir: 'advanced-form',
		locales: ['en', 'uk'],
	},
	{ id: 'toggle', name: 'Toggle', icon: '🔘', type: 'prompt', locales: ['en', 'uk'] },
	{ id: 'slider', name: 'Slider', icon: '🎚️', type: 'prompt', locales: ['en', 'uk'] },
	{
		id: 'ui_message',
		name: 'UI Message',
		icon: '💬',
		type: 'prompt',
		dir: 'ui-message',
		locales: ['en', 'uk'],
	},
	{ id: 'datetime', name: 'DateTime', icon: '📅', type: 'prompt', locales: ['en', 'uk'] },
	{
		id: 'v2_components',
		name: 'V2 Components',
		icon: '✨',
		type: 'view',
		dir: 'v2',
		locales: ['en', 'uk'],
	},
	{ id: 'sortable', name: 'Sortable', icon: '↕️', type: 'prompt', locales: ['en', 'uk'] },
	{
		id: 'object_form',
		name: 'Object Form',
		icon: '🗂️',
		type: 'prompt',
		dir: 'object-form',
		locales: ['en', 'uk'],
	},
	{
		id: 'object_form_complex',
		name: 'Object Form+',
		icon: '🏗️',
		type: 'prompt',
		dir: 'object-form',
		locales: ['en', 'uk'],
	},
]

const SANDBOX_COMPONENTS = [
	{ id: 'alert', name: 'Alert', icon: '🔔', type: 'view' },
	{ id: 'badge', name: 'Badge', icon: '🏷️', type: 'view' },
	{ id: 'toast', name: 'Toast', icon: '🍞', type: 'view' },
	{ id: 'table', name: 'Table', icon: '📊', type: 'view' },
	{ id: 'tabs', name: 'Tabs', icon: '📑', type: 'view' },
	{ id: 'breadcrumbs', name: 'Breadcrumbs', icon: '🧭', type: 'view' },
	{ id: 'steps', name: 'Steps', icon: '🪜', type: 'view' },
	{ id: 'input', name: 'Input', icon: '⌨️', type: 'prompt' },
	{ id: 'password', name: 'Password', icon: '🔑', type: 'prompt' },
	{ id: 'toggle', name: 'Toggle', icon: '🔘', type: 'prompt' },
	{ id: 'confirm', name: 'Confirm', icon: '✅', type: 'prompt' },
	{ id: 'select', name: 'Select', icon: '📋', type: 'prompt' },
	{ id: 'multiselect', name: 'Multiselect', icon: '☑️', type: 'prompt' },
	{ id: 'slider', name: 'Slider', icon: '🎚️', type: 'prompt' },
	{ id: 'datetime', name: 'DateTime', icon: '📅', type: 'prompt' },
	{ id: 'tree', name: 'Tree', icon: '🌳', type: 'prompt' },
	{ id: 'spinner', name: 'Spinner', icon: '⏳', type: 'prompt' },
	{ id: 'progressbar', name: 'ProgressBar', icon: '📶', type: 'prompt' },
	{ id: 'sortable', name: 'Sortable', icon: '↕️', type: 'prompt' },
]

// ============================================================
// State
// ============================================================

let currentLocale = 'en'
let playbackSpeed = 3
/** @type {Terminal|null} */
let modalTerminal = null
/** @type {FitAddon|null} */
let modalFitAddon = null
let currentAnimationId = 0

// ============================================================
// Snapshot Loading
// ============================================================

/** @param {string} path */
async function loadSnap(path) {
	try {
		const res = await fetch(path)
		if (!res.ok) return null
		return await res.text()
	} catch {
		return null
	}
}

/**
 * Build the file path for a play component snapshot
 * @param {Object} comp
 * @param {string} locale
 * @param {number} [frame]
 */
function playSnapPath(comp, locale, frame) {
	const dir = comp.dir || comp.id
	const frameSuffix = frame ? `.${frame}` : ''
	return `${SNAPSHOT_BASE}/play/${dir}/${comp.id}.${locale}${frameSuffix}.snap`
}

/** Build the file path for a sandbox component snapshot */
function sandboxSnapPath(comp, locale = 'en') {
	return `${SNAPSHOT_BASE}/sandbox/${comp.id}/lifecycle.${locale}.snap`
}

// ============================================================
// Terminal Rendering
// ============================================================

const TERMINAL_THEMES = {
	dark: {
		background: '#0d1117',
		foreground: '#c9d1d9',
		cursor: '#58a6ff',
		cursorAccent: '#0d1117',
		selectionBackground: 'rgba(56, 139, 253, 0.3)',
		black: '#484f58',
		red: '#ff7b72',
		green: '#3fb950',
		yellow: '#d29922',
		blue: '#58a6ff',
		magenta: '#bc8cff',
		cyan: '#39c5cf',
		white: '#b1bac4',
		brightBlack: '#6e7681',
		brightRed: '#ffa198',
		brightGreen: '#56d364',
		brightYellow: '#e3b341',
		brightBlue: '#79c0ff',
		brightMagenta: '#d2a8ff',
		brightCyan: '#56d4dd',
		brightWhite: '#f0f6fc',
	},
	light: {
		background: '#ffffff',
		foreground: '#24292f',
		cursor: '#0969da',
		cursorAccent: '#ffffff',
		selectionBackground: 'rgba(9, 105, 218, 0.3)',
		black: '#24292f',
		red: '#cf222e',
		green: '#1a7f37',
		yellow: '#9a6700',
		blue: '#0969da',
		magenta: '#8250df',
		cyan: '#1b7c83',
		white: '#6e7781',
		brightBlack: '#57606a',
		brightRed: '#a40e26',
		brightGreen: '#116329',
		brightYellow: '#805100',
		brightBlue: '#005cc5',
		brightMagenta: '#6e40c9',
		brightCyan: '#059862',
		brightWhite: '#8c959f',
	},
	hc: {
		// High Contrast
		background: '#000000',
		foreground: '#ffffff',
		cursor: '#00ffff',
		cursorAccent: '#000000',
		selectionBackground: 'rgba(0, 255, 255, 0.5)',
		black: '#333333',
		red: '#ff0000',
		green: '#00ff00',
		yellow: '#ffff00',
		blue: '#0000ff',
		magenta: '#ff00ff',
		cyan: '#00ffff',
		white: '#ffffff',
		brightBlack: '#555555',
		brightRed: '#ff5555',
		brightGreen: '#55ff55',
		brightYellow: '#ffff55',
		brightBlue: '#5555ff',
		brightMagenta: '#ff55ff',
		brightCyan: '#55ffff',
		brightWhite: '#ffffff',
	},
}

let currentTheme = 'dark'
const activeTerminals = []

/**
 * Create an xterm.js terminal and mount it
 * @param {HTMLElement} container
 * @param {{ rows?: number, cols?: number, fit?: boolean }} [opts]
 * @returns {{ terminal: Terminal, fitAddon: FitAddon }}
 */
function createTerminal(container, opts = {}) {
	const terminal = new Terminal({
		theme: TERMINAL_THEMES[currentTheme],
		fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
		fontSize: 13,
		lineHeight: 1.3,
		rows: opts.rows || 20,
		cols: opts.cols || 80,
		cursorBlink: false,
		cursorStyle: 'underline',
		disableStdin: true,
		scrollback: 500,
		convertEol: true,
	})

	const fitAddon = new FitAddon()
	terminal.loadAddon(fitAddon)
	terminal.open(container)

	if (opts.fit !== false) {
		requestAnimationFrame(() => fitAddon.fit())
	}

	activeTerminals.push(terminal)

	return { terminal, fitAddon }
}

/**
 * Animate text line-by-line into a terminal
 * @param {Terminal} terminal
 * @param {string} text
 * @param {number} speed - multiplier
 * @param {number} animId - to cancel stale animations
 */
async function animateText(terminal, text, speed = 3, animId = 0) {
	terminal.clear()
	const lines = text.split('\n')
	const baseDelay = 60 / speed

	for (let i = 0; i < lines.length; i++) {
		if (animId !== currentAnimationId) return // cancelled
		terminal.writeln(lines[i])

		// Longer pause after separator lines
		const isSeparator = /^[═━─]{3,}/.test(lines[i]) || /^={10,}/.test(lines[i])
		const delay = isSeparator ? baseDelay * 4 : baseDelay
		await sleep(delay)
	}
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ============================================================
// UI: Component Cards
// ============================================================

/**
 * Create a component card element
 * @param {Object} comp
 * @param {'play'|'sandbox'} section
 */
function createCard(comp, section) {
	const card = document.createElement('div')
	card.className = 'component-card'
	card.dataset.id = comp.id
	card.dataset.section = section

	const typeClass =
		comp.type === 'view' ? 'component-card__type--view' : 'component-card__type--prompt'

	card.innerHTML = `
    <div class="component-card__icon">${comp.icon}</div>
    <div class="component-card__name">${comp.name}</div>
    <div class="component-card__type ${typeClass}">${comp.type}</div>
    <div class="component-card__preview" id="preview-${section}-${comp.id}">Loading...</div>
  `

	card.addEventListener('click', () => openModal(comp, section))

	return card
}

/** Load preview snippet for a card */
async function loadPreview(comp, section) {
	const el = document.getElementById(`preview-${section}-${comp.id}`)
	if (!el) return

	let path
	if (section === 'play') {
		// For multiframe components, load the first frame as preview
		path = comp.frames ? playSnapPath(comp, currentLocale, 1) : playSnapPath(comp, currentLocale)
	} else {
		path = sandboxSnapPath(comp, currentLocale)
	}

	const text = await loadSnap(path)
	if (text) {
		// Show just the first 5 lines as preview
		el.textContent = text.split('\n').slice(0, 5).join('\n')
	} else {
		el.textContent = '(snapshot not found)'
	}
}

// ============================================================
// UI: Modal Terminal Viewer
// ============================================================

const modal = document.getElementById('terminal-modal')
const modalTitleEl = document.getElementById('modal-title')
const modalBody = document.getElementById('modal-terminal')
const modalCloseBtn = document.getElementById('modal-close')
const modalReplayBtn = document.getElementById('modal-replay')
const modalBackdrop = modal.querySelector('.modal__backdrop')

let currentSnapshot = ''
let currentComp = null
let currentSection = ''

async function openModal(comp, section) {
	currentComp = comp
	currentSection = section
	modal.hidden = false
	modalTitleEl.textContent = `${comp.icon} ${comp.name} — ${section === 'play' ? currentLocale.toUpperCase() : 'Lifecycle ' + currentLocale.toUpperCase()}`

	// Create terminal if needed
	if (!modalTerminal) {
		modalBody.innerHTML = ''
		const { terminal, fitAddon } = createTerminal(modalBody, { fit: true, rows: 24 })
		modalTerminal = terminal
		modalFitAddon = fitAddon
	}

	// Load snapshot
	let text
	if (section === 'play') {
		if (comp.frames) {
			// Load all frames
			const frames = []
			for (let i = 1; i <= comp.frames; i++) {
				const f = await loadSnap(playSnapPath(comp, currentLocale, i))
				if (f) frames.push(f)
			}
			text = frames.join('\n\n--- Frame ---\n\n')
		} else {
			text = await loadSnap(playSnapPath(comp, currentLocale))
		}
	} else {
		text = await loadSnap(sandboxSnapPath(comp, currentLocale))
	}

	currentSnapshot = text || '(no snapshot data)'
	replayAnimation()

	// Fit after rendering
	requestAnimationFrame(() => modalFitAddon?.fit())
}

function closeModal() {
	modal.hidden = true
	currentAnimationId++ // cancel running animation
}

function replayAnimation() {
	currentAnimationId++
	animateText(modalTerminal, currentSnapshot, playbackSpeed, currentAnimationId)
}

modalCloseBtn.addEventListener('click', closeModal)
modalBackdrop.addEventListener('click', closeModal)
modalReplayBtn.addEventListener('click', replayAnimation)

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && !modal.hidden) closeModal()
})

// Speed controls
document.querySelectorAll('.speed-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		playbackSpeed = parseInt(btn.dataset.speed)
		document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'))
		btn.classList.add('active')
		replayAnimation()
	})
})

// ============================================================
// ============================================================
// UI: Locale & Theme Toggle
// ============================================================

const localeBtn = document.getElementById('locale-toggle')
localeBtn.addEventListener('click', () => {
	currentLocale = currentLocale === 'en' ? 'uk' : 'en'
	localeBtn.textContent = currentLocale === 'en' ? '🇺🇦 UK' : '🇬🇧 EN'
	// Reload previews
	PLAY_COMPONENTS.forEach((c) => loadPreview(c, 'play'))
	// If modal is open, reload
	if (!modal.hidden && currentSection === 'play') {
		openModal(currentComp, currentSection)
	}
})

const themeBtn = document.getElementById('theme-toggle')
const themes = ['dark', 'light', 'hc']
const themeLabels = { dark: '🌙 Dark', light: '☀️ Light', hc: '👁️ High Contrast' }

themeBtn.addEventListener('click', () => {
	const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length
	currentTheme = themes[nextIdx]

	document.documentElement.setAttribute('data-theme', currentTheme)
	themeBtn.textContent = themeLabels[currentTheme]

	// Update active terminals
	activeTerminals.forEach((term) => {
		term.options.theme = TERMINAL_THEMES[currentTheme]
	})
})

// ============================================================
// UI: Navigation
// ============================================================

document.querySelectorAll('.header__link[data-section]').forEach((link) => {
	link.addEventListener('click', () => {
		document
			.querySelectorAll('.header__link')
			.forEach((l) => l.classList.remove('header__link--active'))
		link.classList.add('header__link--active')
	})
})

// ============================================================
// Hero Terminal
// ============================================================

async function initHeroTerminal() {
	const container = document.getElementById('hero-terminal')
	const { terminal } = createTerminal(container, { rows: 10, cols: 60, fit: true })

	const lines = [
		'\x1b[1;35m◆ nan•web\x1b[0m \x1b[2mui-cli\x1b[0m v2.3.0',
		'',
		'  \x1b[32m✔\x1b[0m 19 components registered',
		'  \x1b[32m✔\x1b[0m 34 golden master snapshots',
		'  \x1b[32m✔\x1b[0m 2 locales (EN/UK)',
		'  \x1b[32m✔\x1b[0m Zero server dependency',
		'',
		'  \x1b[36m$\x1b[0m npx @nan0web/ui-cli sandbox',
		'',
		'  \x1b[2mInteraction as an Engine.\x1b[0m',
	]

	for (const line of lines) {
		terminal.writeln(line)
		await sleep(120)
	}
}

// ============================================================
// Bootstrap
// ============================================================

async function init() {
	const playGrid = document.getElementById('play-grid')
	const sandboxGrid = document.getElementById('sandbox-grid')

	// Render cards
	for (const comp of PLAY_COMPONENTS) {
		playGrid.appendChild(createCard(comp, 'play'))
	}
	for (const comp of SANDBOX_COMPONENTS) {
		sandboxGrid.appendChild(createCard(comp, 'sandbox'))
	}

	// Load previews (non-blocking)
	PLAY_COMPONENTS.forEach((c) => loadPreview(c, 'play'))
	SANDBOX_COMPONENTS.forEach((c) => loadPreview(c, 'sandbox'))

	// Hero
	initHeroTerminal()
}

init()
