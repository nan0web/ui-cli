import { createView } from '../core/Component.js'
import Logger from '@nan0web/log'
import fs from 'node:fs'
import path from 'node:path'

/** ANSI Bold escape — used until @nan0web/log publishes `bold` support */
const BOLD = '\x1b[1m'

/** @typedef {(key: string, vars?: Record<string, any>) => string} TFunction */

/** @this {import('../core/InputAdapter.js').default} */
export function Banner(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Banner', props, () => {
		const text = t(props.text || props.children || '', props)
		if (!text) return ''
		const color = Logger.BG_CYAN + Logger.BLACK
		return `\n${Logger.style(`  ${text}  `, { color })}\n`
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Hero(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Hero', props, () => {
		const { title = '', description = '' } = props
		let out = '\n'
		if (title) out += Logger.style(t(title, props).toUpperCase(), { color: Logger.MAGENTA }) + '\n'
		if (description) out += Logger.style(t(description, props), { color: Logger.DIM }) + '\n'
		out += '─'.repeat(40) + '\n'
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Pricing(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Pricing', props, () => {
		const title = props.title || ''
		const items = Array.isArray(props) ? props : props.items || []
		if (!items.length) return ''

		let out = '\n'
		if (title) out += Logger.style(`  ${t(title, props).toUpperCase()}  `, { color: BOLD + Logger.CYAN }) + '\n'
		items.forEach((plan) => {
			const activePrefix = plan.popular ? '★ ' : '  '
			out += Logger.style(`${activePrefix}${t(plan.title || '', plan)}`, { color: Logger.CYAN }) + '\n'
			if (plan.price) {
				const pr = typeof plan.price === 'object' ? `${plan.price.value ?? plan.price.amount ?? 0} ${plan.price.currency || ''}` : plan.price
				out += `     ${Logger.style(String(pr), { color: BOLD })}\n`
			}
			if (Array.isArray(plan.features)) {
				plan.features.forEach((f) => {
					out += `   │ ${Logger.style('✓', { color: Logger.GREEN })} ${Logger.style(t(f, plan), { color: Logger.DIM })}\n`
				})
			}
			out += '\n'
		})
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Stats(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Stats', props, () => {
		const { title = '', items = [] } = props
		let out = '\n'
		if (title) out += Logger.style(t(title, props), { color: BOLD }) + '\n'
		if (Array.isArray(items)) {
			items.forEach((stat) => {
				const trend = stat.trend ? Logger.style(` ${stat.trend}`, { color: Logger.GREEN }) : ''
				out += ` ${Logger.style(String(stat.value || ''), { color: BOLD + Logger.GREEN })} ${t(stat.label || '', stat)}${trend}\n`
			})
		}
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Timeline(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Timeline', props, () => {
		const { title = '', items = [] } = props
		let out = '\n'
		if (title) out += Logger.style(` ${t(title)} `, { color: BOLD }) + '\n'
		if (Array.isArray(items)) {
			items.forEach((item, idx) => {
				const isLast = idx === items.length - 1
				out += ` • ${Logger.style(item.date || '', { color: Logger.CYAN })}\n`
				if (item.title) out += ` │   ${Logger.style(t(item.title), {})}\n`
				if (item.description) out += ` │   ${Logger.style(t(item.description), { color: Logger.DIM })}\n`
				if (!isLast) out += ` │\n`
			})
		}
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Testimonials(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Testimonials', props, () => {
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		items.forEach((item) => {
			const text = t(item.content || item.text || '')
			out += Logger.style(`  "${text}"`, { color: Logger.DIM }) + '\n'
			if (item.author) out += `  — ${t(item.author)}`
			if (item.rating) {
				const stars = '★'.repeat(item.rating)
				out += ` (${Logger.style(stars, { color: Logger.YELLOW })})`
			}
			out += '\n\n'
		})
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Accordion(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Accordion', props, () => {
		const title = props.title || ''
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		if (title) out += Logger.style(` ${t(title, props)} `, { color: BOLD }) + '\n'
		items.forEach((item) => {
			out += Logger.style(` ▶ ${t(item.title || item.question || '', item)}`, {}) + '\n'
			out += Logger.style(`   ${t(item.content || item.answer || '', item)}`, { color: Logger.DIM }) + '\n\n'
		})
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Gallery(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Gallery', props, () => {
		const title = props.title || ''
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		if (title) out += Logger.style(` ${t(title, props)} `, { color: BOLD }) + '\n'

		const isITerm2 = process.env.TERM_PROGRAM === 'iTerm.app' || process.env.LC_TERMINAL === 'iTerm2'
		const isKitty = process.env.TERM === 'xterm-kitty'

		items.forEach((item) => {
			const src = typeof item === 'string' ? item : item.src || item.url || ''
			const caption = typeof item === 'object' && item.caption ? ` ${Logger.style(t(item.caption, item), { color: Logger.DIM })}` : ''

			if ((isITerm2 || isKitty) && src && !src.startsWith('http') && fs.existsSync(src)) {
				try {
					const buf = fs.readFileSync(src)
					const b64 = buf.toString('base64')
					if (isITerm2) {
						out += `\x1b]1337;File=inline=1;width=auto;height=auto:${b64}\x07\n`
					} else if (isKitty) {
						out += `\x1b_Gf=100,a=T,m=0;${b64}\x1b\\\n`
					}
				} catch (e) {
					// Fallback to icon
					out += ` 🖼  ${Logger.style(src, { color: Logger.CYAN })}${caption}\n`
				}
			} else {
				out += ` 🖼  ${Logger.style(src, { color: Logger.CYAN })}${caption}\n`
			}
		})
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function EmptyState(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('EmptyState', props, () => {
		const title = t(props.title || '')
		const description = t(props.description || '')
		let out = '\n'
		const w = Math.max(title.length, description.length, 20)
		const icon = '∅'
		const padding = ' '.repeat(Math.max(0, Math.floor(w / 2) - 1))
		out += Logger.style(padding + icon + '\n', { color: Logger.DIM })
		if (title) out += Logger.style(title, { color: BOLD }) + '\n'
		if (description) out += Logger.style(description, { color: Logger.DIM }) + '\n'
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Header(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Header', props, () => {
		const { title = '', links = [] } = props
		let out = '\n'
		out += Logger.style(t(title), { color: BOLD })
		if (Array.isArray(links) && links.length) {
			out += '  ' + links.map((l) => Logger.style(t(l.label || l.title || l), { color: Logger.CYAN })).join('  ')
		}
		out += '\n' + '═'.repeat(40) + '\n'
		return out
	})
}

/** @this {import('../core/InputAdapter.js').default} */
export function Footer(props = {}) {
	/** @type {TFunction} */
	const t = this?.t || ((k) => k)
	return createView('Footer', props, () => {
		const { title = '', text = '', links = [] } = props
		let out = '\n' + '─'.repeat(40) + '\n'
		if (title) out += Logger.style(t(title), {}) + '\n'
		if (text) out += Logger.style(t(text), { color: Logger.DIM }) + '\n'
		if (Array.isArray(links) && links.length) {
			out += links.map((l) => Logger.style(t(l.label || l.title || l), { color: Logger.DIM })).join(' | ') + '\n'
		}
		return out
	})
}
