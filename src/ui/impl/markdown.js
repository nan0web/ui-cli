import process from 'node:process'
import readline from 'node:readline'
import Logger from '@nan0web/log'
import { CancelError } from '@nan0web/ui/core'
import { Markdown, MDElement } from '@nan0web/markdown'
import prompts from './prompts.js'
import { ContentViewerModel } from '../../domain/prompt/ContentViewerModel.js'

const ESC = '\x1B['
const HIDE_CURSOR = `${ESC}?25l`
const SHOW_CURSOR = `${ESC}?25h`
const UP = (n = 1) => `${ESC}${n}A`
const ERASE_DOWN = `${ESC}J`
const REPLACEMENTS = {
	'### ': '#3 ',
	'#### ': '#4 ',
	'##### ': '#5 ',
	'###### ': '#6 ',
}
const spaceGutter = '    |'

export function renderMarkdown(content) {
	/** @type {MDElement[]} */
	let ast = []
	if (typeof content === 'string') {
		const md = new Markdown()
		ast = md.parse(content)
	} else if (Array.isArray(content)) {
		ast = content
	} else if (content && content.children) {
		ast = content.children
	}
	const lines = []
	for (let i = 0; i < ast.length; i++) {
		const node = ast[i]
		const type = node.constructor.name

		let text = String(node.content || '')
		let rawTag = 'function' === typeof node.mdTag ? node.mdTag(node) : node.mdTag
		let rawEnd = 'function' === typeof node.mdEnd ? node.mdEnd(node) : node.mdEnd

		if (type === 'MDCodeBlock') {
			rawTag = '{}  '
			rawEnd = ''
		}

		if (rawTag && rawTag.includes('\n') && rawTag.trim() !== '') {
			const parts = rawTag.trim().split('\n')
			for (let p = 0; p < parts.length; p++) {
				lines.push({ gutter: spaceGutter, text: parts[p] })
			}
			rawTag = ''
		}

		let gutter = rawTag
		if (gutter in REPLACEMENTS) gutter = REPLACEMENTS[gutter]
		gutter = String(gutter || '').padEnd(4, ' ') + '|'

		// Handle empty lines or spacing nodes
		if (text.trim() === '') {
			if (text.includes('\n') || type === 'MDSpace') {
				lines.push({ gutter: spaceGutter, text: '' })
			}
			continue
		}

		const innerWidth = (process.stdout.columns || 80) - 7

		// Split by explicit newlines to preserve <br> / soft breaks (two spaces at end)
		const sourceLines = text.split('\n')
		let firstChunkProcessed = false

		for (const sourceLine of sourceLines) {
			const chunks = []
			let currentStr = sourceLine
			if (currentStr === '') {
				lines.push({ gutter: spaceGutter, text: '' })
				continue
			}

			while (currentStr.length > innerWidth) {
				chunks.push(currentStr.slice(0, innerWidth))
				currentStr = currentStr.slice(innerWidth)
			}
			chunks.push(currentStr)

			chunks.forEach((chunk, matchIdx) => {
				lines.push({
					gutter: !firstChunkProcessed ? gutter : spaceGutter,
					text: chunk
				})
				firstChunkProcessed = true
			})
		}

		if (rawEnd && rawEnd.trim() !== '') {
			const parts = rawEnd.trim().split('\n')
			for (let p = 0; p < parts.length; p++) {
				lines.push({ gutter: spaceGutter, text: parts[p] })
			}
		}

		if (type !== 'MDSpace') {
			lines.push({ gutter: spaceGutter, text: '' })
		}
	}

	if (lines.length === 0) {
		lines.push({ gutter: spaceGutter, text: 'Empty content' })
	}

	return lines.map(l => `${Logger.style(l.gutter, {color: Logger.DIM})} ${l.text}`).join('\n')
}

/**
 * Scrollable markdown content viewer with interactive elements (links, forms).
 *
 * @param {Object} config - Viewer configuration.
 * @param {string|Array|Object} config.content - Content to render (Raw Markdown or AST).
 * @param {string} [config.title] - Title string for the viewer header.
 * @param {number} [config.offset] - Initial scroll offset.
 * @param {number} [config.focusedIndex] - Initial focused interactive element index.
 * @param {Function} [config.t] - Translation function.
 * @param {boolean} [config.print] - If true, just print and exit.
 * @param {string} [config.select] - Selection label.
 * @param {string} [config.focus] - Focus label.
 * @param {string} [config.scroll] - Scroll label.
 * @param {string} [config.back] - Back label.

 * @param {Object} [config.console] - Logger instance.
 * @returns {Promise<{value: any, type?: string, action?: string, cancelled: boolean}>}}
 *   - value: selected item (link object, form model, etc.)
 *   - type: 'form_open' if a form was selected
 *   - action: 'back' or 'exit'
 */
export async function markdownViewer(config) {
	const {
		content = '',
		title,
		t = (k) => k,
		console = new Logger(),
	} = config

	const { stdin, stdout } = process

	if ((!stdout.isTTY && !process.env.UI_SNAPSHOT) || config.print) {
		const out = renderMarkdown(content)
		console.info(out)
		return { value: undefined, cancelled: false, action: 'exit' }
	}

	// Parse markdown text using the markdown package
	let ast = []
	if (typeof content === 'string') {
		const md = new Markdown()
		ast = md.parse(content)
	} else if (Array.isArray(content)) {
		ast = content
	} else if (content && content.children) {
		ast = content.children
	}

	// Build renderable lines and interactive items
	// Build renderable lines and interactive items
	const lines = []
	const interactives = []
	const innerWidth = (stdout.columns || 80) - 7

	// Flexible AST render supporting shorthand (h1, p, ul, form) and $metadata
	for (let i = 0; i < ast.length; i++) {
		const node = ast[i]
		let type = String(node?.constructor?.name || (node && node.type) || 'Object').toUpperCase()

		// Map shorthand keys (h1, p, ul, form) to types
		if (node.h1) type = 'H1'
		else if (node.h2) type = 'H2'
		else if (node.h3) type = 'H3'
		else if (node.p) type = 'P'
		else if (node.ul) type = 'UL'
		else if (node.form) type = 'FORM'
		else if (node.hr) type = 'HORIZONTALRULE'

		let text = (node.content || node.h1 || node.h2 || node.h3 || node.p || node.text || '')
		text = t(text)
		let firstChunkProcessed = false
		let gutter = 'p   |'
		let color = String(Logger.WHITE)
		let nodeType = 'text'

		if (type.includes('HEADING') || type.startsWith('H')) {
			const levelMatch = type.match(/\d+/)
			const level = levelMatch ? levelMatch[0] : '#'
			gutter = `H${level}  |`;
			color = Logger.CYAN;
			text = Logger.style(text, /** @type {any} */ ({ color: Logger.CYAN, bold: true }))
		}
		else if (type.includes('IMAGE')) { gutter = 'img |'; color = Logger.DIM; }
		else if (type.includes('LINK')) { gutter = 'lnk |'; color = Logger.BLUE; nodeType = 'link' }
		else if (type.includes('LIST') || type === 'UL') {
			gutter = '*   |';
			color = Logger.WHITE;
			const items = node.items || node.ul
			if (Array.isArray(items)) {
				text = items.map(it => `• ${String(t(it))}`).join('\n')
			}
		}
		else if (type.includes('CODE')) { gutter = '{ } |'; color = Logger.YELLOW; }
		else if (type.includes('HORIZONTALRULE')) { gutter = '--- |'; color = Logger.DIM; text = '-'.repeat(innerWidth) }
		else if (type.includes('FORM') || type === 'FORM') {
			gutter = 'frm |';
			color = Logger.MAGENTA;
			const formModel = node.form || node
			const formTitle = t(formModel.title || node.$title || node.title || 'Unnamed')
			text = `[ Form: ${formTitle} ]`;
			nodeType = 'form'
		}


		// Handle empty lines or spacing nodes
		if (text.trim() === '' && nodeType !== 'form') {
			if (text.includes('\n') || type === 'MDSpace') {
				lines.push({ gutter: spaceGutter, text: '', interactive: false })
			}
			continue
		}

		const sourceLines = String(text).split('\n')

		for (const sourceLine of sourceLines) {
			const chunks = []
			let currentStr = sourceLine
			if (currentStr === '' && !firstChunkProcessed) {
				lines.push({ gutter, color, text: '', interactive: false })
				firstChunkProcessed = true
				continue
			} else if (currentStr === '') {
				lines.push({ gutter: spaceGutter, text: '', interactive: false })
				continue
			}

			while (currentStr.length > innerWidth) {
				chunks.push(currentStr.slice(0, innerWidth))
				currentStr = currentStr.slice(innerWidth)
			}
			chunks.push(currentStr)

			chunks.forEach((chunk) => {
				const isForm = nodeType === 'form'
				let lineView = ''
				const lineInteractives = []

				if (isForm) {
					lineView = chunk
					const formModel = node.form || node
					const interactInfo = {
						type: 'form',
						title: formModel.title || node.title,
						model: formModel,
						lineIdx: lines.length,
						start: 0,
						end: chunk.length,
						$id: formModel.$id || node.$id,
						id: formModel.$id || node.$id
					}
					interactives.push(interactInfo)
					lineInteractives.push(interactInfo)
				} else {
					// Handle multiple links in one line
					const linkRegex = /\[(.*?)\]\((.*?)\)/g
					let match
					let lastMatchEnd = 0

					while ((match = linkRegex.exec(chunk)) !== null) {
						const raw = match[0]
						const title = match[1]
						const url = match[2]

						lineView += chunk.slice(lastMatchEnd, match.index)

						const startInSimplified = lineView.length
						const endInSimplified = startInSimplified + title.length

						const interactInfo = {
							type: 'link',
							title,
							url,
							lineIdx: lines.length,
							start: startInSimplified,
							end: endInSimplified
						}
						interactives.push(interactInfo)
						lineInteractives.push(interactInfo)

						lineView += title
						lastMatchEnd = match.index + raw.length
					}
					lineView += chunk.slice(lastMatchEnd)
				}

				lines.push({
					gutter: !firstChunkProcessed ? gutter : spaceGutter,
					color,
					text: lineView,
					interactives: lineInteractives
				})

				firstChunkProcessed = true
			})
		}

		if (type !== 'MDSpace') {
			lines.push({ gutter: spaceGutter, text: '', interactive: false })
		}
	}

	if (lines.length === 0) {
		lines.push({ gutter: spaceGutter, text: 'Empty content', nodeRef: null })
	}

	const termRows = (stdout.rows || 25)
	const termCols = (stdout.columns || 80)

	// Adaptive limit: occupy full height only if content is large
	const maxLimit = Math.max(5, termRows - 3)
	const limit = Math.min(maxLimit, Math.max(5, lines.length))

	let offset = config.offset || 0
	let focusedIndex = config.focusedIndex !== undefined ? config.focusedIndex : (interactives.length > 0 ? 0 : -1)

	let linesRendered = 0

	// Automated Snapshot Handling
	if (process.env.UI_SNAPSHOT || process.env.PLAY_DEMO_SEQUENCE) {
		const termCols = (stdout.columns || 80)
		const titleStr = title || 'ContentViewer'
		const filler = ' '.repeat(Math.max(0, termCols - titleStr.length - 2))
		let out = `\n` + Logger.style(' ' + titleStr + ' ' + filler, /** @type {any} */ ({ bgColor: 'white', color: 'black', bold: true })) + '\n'

		out += lines.map(l => `${Logger.style(l.gutter, {color: Logger.DIM})} ${l.text}`).join('\n')
		const percent = Math.min(100, Math.round((limit / lines.length) * 100))

		const labelSelect = t(config.select || ContentViewerModel.UI.select)
		const labelFocus = t(config.focus || ContentViewerModel.UI.focus)
		const labelScroll = t(config.scroll || ContentViewerModel.UI.scroll)
		const labelBack = t(config.back || ContentViewerModel.UI.back)

		const footerTextRaw = `[ ${percent}% ] ${labelFocus}: ${interactives.length} | [Enter] ${labelSelect} [Esc] ${labelBack}`

		out += `\n` + Logger.BG_BLACK + Logger.style(footerTextRaw.slice(0, termCols).padEnd(termCols), { color: Logger.CYAN }) + Logger.RESET + `\n`
		stdout.write(out)

		if (prompts._injected && prompts._injected.length > 0) {
			const predefined = prompts._injected.shift()
			if (predefined instanceof Error) throw new CancelError()

			if (predefined === '::back' || predefined === 'esc') {
				return { action: 'back', value: { action: 'back' }, cancelled: true }
			}

			// Try to match interactive element
			const matched = interactives.find(i =>
				i.id === predefined ||
				i.$id === predefined ||
				i.title === predefined ||
				i.url === predefined ||
				(i.model && (i.model.id === predefined || i.model.$id === predefined)) ||
				(typeof predefined === 'number' && interactives.indexOf(i) === predefined)
			)

			if (matched) {
				if (matched.type === 'form') {
					return { type: 'form_open', value: matched.model, cancelled: false }
				}
				return { value: matched, cancelled: false }
			}

			// We format it as a URL/action return
			if (predefined) {
				return { value: { url: predefined }, cancelled: false }
			}
		}
		// Default backward/cancel return if no predefined
		return { value: null, cancelled: true }
	}


	function render() {
		const termRows = (stdout.rows || 25)
		const termCols = (stdout.columns || 80)

		// Clean previous frame
		if (linesRendered > 0) {
			stdout.write('\r' + UP(linesRendered - 1) + ERASE_DOWN)
		}

		let out = ''

		// Title bar (Nano-lite style)
		const titleStr = title || 'ContentViewer'
		const filler = ' '.repeat(Math.max(0, termCols - titleStr.length - 2))
		const titleLine = Logger.style(' ' + titleStr + ' ' + filler, /** @type {any} */ ({ bgColor: 'white', color: 'black', bold: true }))
		out += titleLine + '\n'

		// Visible window
		const visibleOffset = Math.min(offset, Math.max(0, lines.length - limit))
		const visible = lines.slice(visibleOffset, visibleOffset + limit)

		for (let i = 0; i < visible.length; i++) {
			const lineIdx = visibleOffset + i
			const line = visible[i]
			const activeInt = interactives[focusedIndex]
			const isFocusedLine = activeInt && activeInt.lineIdx === lineIdx

			let gutterText = line.gutter
			if (isFocusedLine) {
				gutterText = gutterText.replace('|', '+')
			}

			const gutterStyled = Logger.style(gutterText, /** @type {any} */ ({
				color: isFocusedLine ? Logger.YELLOW : Logger.DIM,
				bold: isFocusedLine
			}))

			let textContent = line.text
			let textStyled = ''

			// If the line has interactive elements, style them piece by piece
			if (line.interactives && line.interactives.length > 0) {
				let lastPos = 0
				// Sort line interactives by start position to be safe
				const sortedInts = [...line.interactives].sort((a, b) => a.start - b.start)

				for (const int of sortedInts) {
					// Add text before element
					textStyled += textContent.slice(lastPos, int.start)

					const isFocused = activeInt === int
					const symbol = int.type === 'form' ? (isFocused ? '◈' : '◇') : (isFocused ? '▶' : '○')
					const linkText = `${symbol} ${textContent.slice(int.start, int.end)}`

					if (isFocused) {
						textStyled += Logger.style(linkText, /** @type {any} */ ({ color: Logger.YELLOW, bold: true }))
					} else {
						textStyled += Logger.style(linkText, { color: Logger.CYAN })
					}
					lastPos = int.end
				}
				// Add remaining text
				textStyled += textContent.slice(lastPos)
			} else {
				textStyled = textContent
			}

			out += `${gutterStyled} ${textStyled}\n`
		}

		// Empty lines filler
		for (let i = visible.length; i < limit; i++) {
			out += `${Logger.style(spaceGutter, {color: Logger.DIM})}\n`
		}

		// Footer - Status Bar
		const percent = Math.min(100, Math.round(((visibleOffset + limit) / Math.max(1, lines.length)) * 100))
		let focusSummary = interactives.length > 0 ? ` [${focusedIndex + 1}/${interactives.length}]` : ''

		const labelSelect = t(config.select || ContentViewerModel.UI.select)
		const labelFocus = t(config.focus || ContentViewerModel.UI.focus)
		const labelScroll = t(config.scroll || ContentViewerModel.UI.scroll)
		const labelBack = t(config.back || ContentViewerModel.UI.back)

		const footerTextRaw = `[ ${percent}% ] ${labelFocus}: ${interactives.length}${focusSummary} | [Enter] ${labelSelect} [Tab/S-Tab] ${labelFocus} [Arrows] ${labelScroll} [Esc] ${labelBack}`

		// STRICT TRUNCATE to avoid terminal wrap and "sliding"
		const footerTextTrimmed = footerTextRaw.slice(0, termCols)
		const footerFiller = ' '.repeat(Math.max(0, termCols - footerTextTrimmed.length))

		out += Logger.BG_BLACK + Logger.style(footerTextTrimmed + footerFiller, { color: Logger.CYAN })

		stdout.write(out)
		linesRendered = out.split('\n').length
	}


	return new Promise((resolve, reject) => {
		const onKey = async (str, key) => {
			if (key.ctrl && key.name === 'c') {
				cleanup()
				reject(new CancelError())
				return
			}
			switch (key.name) {
				case 'up':
					if (offset > 0) offset--
					break
				case 'down':
					if (offset + limit < lines.length) offset++
					break
				case 'escape':
					cleanup()
					resolve({ action: 'back', value: { action: 'back' }, cancelled: true })
					return
				case 'right':
				case 'tab':
					if (interactives.length > 0) {
						if (key.shift) {
							focusedIndex = (focusedIndex > 0 ? focusedIndex - 1 : interactives.length - 1)
						} else {
							focusedIndex = (focusedIndex + 1) % interactives.length
						}
						// Auto scroll
						const fLine = interactives[focusedIndex].lineIdx
						if (fLine < offset || fLine >= offset + limit) {
							offset = Math.max(0, fLine - Math.floor(limit / 2))
						}
					}
					break
				case 'left':
					if (interactives.length > 0) {
						focusedIndex = focusedIndex - 1
						if (focusedIndex < 0) focusedIndex = interactives.length - 1
						// Auto scroll
						const fLine = interactives[focusedIndex].lineIdx
						if (fLine < offset || fLine >= offset + limit) {
							offset = Math.max(0, fLine - Math.floor(limit / 2))
						}
					}
					break
				case 'return':
				case 'enter':
					const currentItem = interactives[focusedIndex]
					if (currentItem && currentItem.type === 'form') {
						// Launch sub-form
						cleanup()
						// Special return for form processing
						resolve({ type: 'form_open', value: currentItem.model, cancelled: false })
						return
					}

					cleanup(false) // Do NOT erase on confirm
					if (focusedIndex >= 0 && interactives[focusedIndex]) {
						resolve({ value: interactives[focusedIndex], cancelled: false })
					} else {
						resolve({ action: 'exit', value: { action: 'exit' }, cancelled: false })
					}
					return
			}
			render()
		}

		function cleanup(erase = true) {
			stdin.removeListener('keypress', onKey)
			if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
				process.stdin.setRawMode(false)
			}
			stdin.pause()
			if (erase) {
				stdout.write('\r' + UP(linesRendered - 1) + ERASE_DOWN)
			} else {
				// Final render without the status bar footer?
				// Actually, just leaving it is fine, but we might want to clear the footer line.
				stdout.write('\n')
			}
			stdout.write(SHOW_CURSOR)
		}

		if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
			stdin.setRawMode(true)
		}
		stdin.resume()
		readline.emitKeypressEvents(stdin)
		stdin.on('keypress', onKey)
		stdout.write(HIDE_CURSOR)
		render()
	})

}
