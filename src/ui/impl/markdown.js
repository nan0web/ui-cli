import process from 'node:process'
import readline from 'node:readline'
import Logger from '@nan0web/log'
import { CancelError } from '@nan0web/ui/core'
import MarkdownParser from '@nan0web/markdown/Markdown.js'
import prompts from './prompts.js'

const ESC = '\x1B['
const HIDE_CURSOR = `${ESC}?25l`
const SHOW_CURSOR = `${ESC}?25h`
const UP = (n = 1) => `${ESC}${n}A`
const ERASE_DOWN = `${ESC}J`

export function renderMarkdown(content) {
	let ast = []
	if (typeof content === 'string') {
		const md = new MarkdownParser()
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
		
		let text = (node.content || '')
		let gutter = 'p  |'
		
		if (type.includes('Heading1')) { gutter = 'H1 |'; text = Logger.style(text, { color: Logger.CYAN }) }
		else if (type.includes('Heading2')) { gutter = 'H2 |'; text = Logger.style(text, { color: Logger.CYAN }) }
		else if (type.includes('Heading')) { gutter = 'H# |' }
		else if (type.includes('Image')) { gutter = 'img|' }
		else if (type.includes('Link')) { gutter = 'lnk|' }
		else if (type.includes('List')) { gutter = '*  |' }
		else if (type.includes('Code')) { gutter = '{ }|' }
		else if (type.includes('HorizontalRule')) { gutter = '---|' }

		// Handle empty lines or spacing nodes
		if (text.trim() === '') {
			if (text.includes('\n') || type === 'MDSpace') {
				lines.push({ gutter: '   |', text: '' })
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
				lines.push({ gutter: '   |', text: '' })
				continue
			}

			while (currentStr.length > innerWidth) {
				chunks.push(currentStr.slice(0, innerWidth))
				currentStr = currentStr.slice(innerWidth)
			}
			chunks.push(currentStr)

			chunks.forEach((chunk, matchIdx) => {
				lines.push({
					gutter: !firstChunkProcessed ? gutter : '   |',
					text: chunk
				})
				firstChunkProcessed = true
			})
		}
		
		if (type !== 'MDSpace') {
			lines.push({ gutter: '   |', text: '' })
		}
	}

	if (lines.length === 0) {
		lines.push({ gutter: '   |', text: 'Empty content' })
	}

	return lines.map(l => `${Logger.style(l.gutter, {color: Logger.DIM})} ${l.text}`).join('\n')
}

export async function markdownViewer(config) {
	const {
		content = '',
		t = (k) => k,
		console = new Logger(),
	} = config

	const { stdin, stdout } = process
	const limit = Math.max(10, (stdout.rows || 24) - 4)

	// Parse markdown text using the markdown package
	let ast = []
	if (typeof content === 'string') {
		const md = new MarkdownParser()
		ast = md.parse(content)
	} else if (Array.isArray(content)) {
		ast = content
	} else if (content && content.children) {
		ast = content.children
	}

	// Build renderable lines and interactive items
	const lines = []
	const interactives = []

	// Very simple flat AST render for now
	for (let i = 0; i < ast.length; i++) {
		const node = ast[i]
		const type = node.constructor.name
		
		let text = (node.content || '')
		let gutter = 'p  |'
		let color = String(Logger.WHITE)
		
		if (type.includes('Heading1')) { gutter = 'H1 |'; color = Logger.CYAN; text = Logger.style(text, { color: Logger.CYAN }) }
		else if (type.includes('Heading2')) { gutter = 'H2 |'; color = Logger.CYAN; text = Logger.style(text, { color: Logger.CYAN }) }
		else if (type.includes('Heading')) { gutter = 'H# |'; color = Logger.CYAN; }
		else if (type.includes('Image')) { gutter = 'img|'; color = Logger.DIM; }
		else if (type.includes('Link')) { gutter = 'lnk|'; color = Logger.BLUE; }
		else if (type.includes('List')) { gutter = '*  |'; color = Logger.WHITE; }
		else if (type.includes('Code')) { gutter = '{ }|'; color = Logger.YELLOW; }
		else if (type.includes('HorizontalRule')) { gutter = '---|'; color = Logger.DIM; }

		// Handle empty lines or spacing nodes
		if (text.trim() === '') {
			if (text.includes('\n') || type === 'MDSpace') {
				lines.push({ gutter: '   |', text: '', interactive: false })
			}
			continue
		}

		const innerWidth = (stdout.columns || 80) - 7
		const sourceLines = text.split('\n')
		let firstChunkProcessed = false

		for (const sourceLine of sourceLines) {
			const chunks = []
			let currentStr = sourceLine
			if (currentStr === '') {
				lines.push({ gutter: '   |', text: '', interactive: false })
				continue
			}

			while (currentStr.length > innerWidth) {
				chunks.push(currentStr.slice(0, innerWidth))
				currentStr = currentStr.slice(innerWidth)
			}
			chunks.push(currentStr)

			chunks.forEach((chunk, matchIdx) => {
				const isLink = type.includes('Link') || /\[.*?\]\(.*?\)/.test(chunk)
				
				let interactInfo = null
				if (isLink) {
					// Extract link title and URL if possible
					const linkMatch = chunk.match(/\[(.*?)\]\((.*?)\)/)
					if (linkMatch) {
						interactInfo = { title: linkMatch[1], url: linkMatch[2], lineIdx: lines.length }
						interactives.push(interactInfo)
					} else {
						// Fallback dummy
						interactInfo = { title: chunk, url: chunk, lineIdx: lines.length }
						interactives.push(interactInfo)
					}
				}
				
				lines.push({
					gutter: !firstChunkProcessed ? gutter : '   |',
					color,
					text: chunk,
					interactive: interactInfo
				})
				firstChunkProcessed = true
			})
		}
		
		if (type !== 'MDSpace') {
			lines.push({ gutter: '   |', text: '', interactive: false })
		}
	}

	if (lines.length === 0) {
		lines.push({ gutter: '   |', text: 'Empty content', nodeRef: null })
	}

	let offset = 0
	let focusedIndex = -1 // No focus initially
	
	let linesRendered = 0
	let firstRender = true

	// Automated Snapshot Handling
	if (process.env.UI_SNAPSHOT || process.env.PLAY_DEMO_SEQUENCE) {
		let out = `\n` + lines.map(l => `${Logger.style(l.gutter, {color: Logger.DIM})} ${l.text}`).join('\n')
		out += `\n[Footer] 100% | Enter: select | Esc: back\n`
		stdout.write(out)
		if (prompts._injected && prompts._injected.length > 0) {
			const predefined = prompts._injected.shift()
			if (predefined instanceof Error) throw new CancelError()
			
			// We format it as a URL/action return
			if (predefined) {
				return { value: { url: predefined }, cancelled: false }
			}
		}
		// Default backward/cancel return if no predefined
		return { cancelled: true }
	}

	function render() {
		if (!firstRender) {
			stdout.write(UP(linesRendered) + ERASE_DOWN)
		}
		firstRender = false

		let out = ''
		
		// Visible window
		const visible = lines.slice(offset, offset + limit)
		
		for (let i = 0; i < visible.length; i++) {
			const lineIdx = offset + i
			const line = visible[i]
			
			// Is any interactive element focused on this line?
			const activeInt = interactives[focusedIndex]
			const isLineFocused = activeInt && activeInt.lineIdx === lineIdx

			const gutterStyled = Logger.style(line.gutter, { color: Logger.DIM })
			let textStyled = line.text
			
			if (isLineFocused) {
				textStyled = Logger.style(`> ${textStyled} <`, { color: Logger.GREEN })
			}

			out += `${gutterStyled} ${textStyled}\n`
		}
		
		// Fill empty space if content is smaller than limit
		for (let i = visible.length; i < limit; i++) {
			out += `${Logger.style('   |', {color: Logger.DIM})}\n`
		}

		// Footer
		const percent = Math.min(100, Math.round(((offset + limit) / Math.max(1, lines.length)) * 100))
		let focusHelp = focusedIndex >= 0 ? `Selected: ${interactives[focusedIndex].label}` : ''
		const footerText = `[ ${percent}% ] Focus: ${interactives.length} elems | [Enter: обрати] [Esc: назад] [⬆/⬇: скрол] [⬅/➡: фокус]`
		out += Logger.BG_BLACK + Logger.style(footerText, { color: Logger.CYAN }) + Logger.RESET
		
		stdout.write(out + '\n')
		linesRendered = out.split('\n').length - 1
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
					resolve({ action: 'back', cancelled: true })
					return
				case 'right':
				case 'tab':
					if (interactives.length > 0) {
						focusedIndex = (focusedIndex + 1) % interactives.length
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
					cleanup()
					if (focusedIndex >= 0 && interactives[focusedIndex]) {
						resolve(interactives[focusedIndex])
					} else {
						resolve({ action: 'exit', cancelled: false })
					}
					return
			}
			render()
		}

		function cleanup() {
			stdin.removeListener('keypress', onKey)
			if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
				process.stdin.setRawMode(false)
			}
			stdin.pause()
			stdout.write(UP(linesRendered) + ERASE_DOWN)
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
