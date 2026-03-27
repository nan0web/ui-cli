import { createView } from '../core/Component.js'
import Logger from '@nan0web/log'

export function Banner(props = {}) {
	return createView('Banner', props, () => {
		const text = props.text || props.children || ''
		if (!text) return ''
		const color = Logger.BG_CYAN + Logger.BLACK
		return `\n${Logger.style(`  ${text}  `, { color })}\n`
	})
}

export function Hero(props = {}) {
	return createView('Hero', props, () => {
		const { title = '', description = '' } = props
		let out = '\n'
		if (title) out += Logger.style(title.toUpperCase(), { color: Logger.MAGENTA }) + '\n'
		if (description) out += Logger.style(description, { color: Logger.DIM }) + '\n'
		out += '─'.repeat(40) + '\n'
		return out
	})
}

export function Pricing(props = {}) {
	return createView('Pricing', props, () => {
		const items = Array.isArray(props) ? props : props.items || []
		if (!items.length) return ''
		
		let out = '\n'
		items.forEach(plan => {
			const activePrefix = plan.popular ? '★ ' : '  '
			out += Logger.style(`${activePrefix}${plan.title || ''}`, { color: Logger.CYAN }) + '\n'
			if (plan.price) {
				const pr = typeof plan.price === 'object' ? `${plan.price.amount} ${plan.price.currency}` : plan.price
				out += `   ${pr}\n`
			}
			if (Array.isArray(plan.features)) {
				plan.features.forEach(f => {
					out += Logger.style(`   ✓ ${f}`, { color: Logger.DIM }) + '\n'
				})
			}
			out += '\n'
		})
		return out
	})
}

export function Stats(props = {}) {
	return createView('Stats', props, () => {
		const { title = '', items = [] } = props
		let out = '\n'
		if (title) out += Logger.style(title, { }) + '\n'
		if (Array.isArray(items)) {
			items.forEach(stat => {
				const trend = stat.trend ? (stat.trend > 0 ? '↑' : '↓') : ''
				out += ` ${Logger.style(String(stat.value || ''), { color: Logger.GREEN })} ${stat.label || ''} ${trend}\n`
			})
		}
		return out
	})
}

export function Timeline(props = {}) {
	return createView('Timeline', props, () => {
		const { items = [] } = props
		let out = '\n'
		if (Array.isArray(items)) {
			items.forEach((item, idx) => {
				const isLast = idx === items.length - 1
				out += ` • ${Logger.style(item.date || '', { color: Logger.CYAN })}\n`
				if (item.title) out += ` │   ${Logger.style(item.title, { })}\n`
				if (item.description) out += ` │   ${Logger.style(item.description, { color: Logger.DIM })}\n`
				if (!isLast) out += ` │\n`
			})
		}
		return out
	})
}

export function Testimonials(props = {}) {
	return createView('Testimonials', props, () => {
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		items.forEach(item => {
			const text = item.content || item.text || ''
			out += Logger.style(`  "${text}"`, { color: Logger.DIM }) + '\n'
			if (item.author) out += `  — ${item.author}`
			if (item.rating) out += ` (${'★'.repeat(item.rating)})`
			out += '\n\n'
		})
		return out
	})
}

export function Accordion(props = {}) {
	return createView('Accordion', props, () => {
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		items.forEach(item => {
			out += Logger.style(` ▶ ${item.title || item.question || ''}`, { }) + '\n'
			out += Logger.style(`   ${item.content || item.answer || ''}`, { color: Logger.DIM }) + '\n\n'
		})
		return out
	})
}

export function Gallery(props = {}) {
	return createView('Gallery', props, () => {
		const items = Array.isArray(props) ? props : props.items || []
		let out = '\n'
		items.forEach((item, idx) => {
			const src = typeof item === 'string' ? item : item.src || item.url || ''
			out += ` 🖼  ${Logger.style(src, { color: Logger.CYAN })}\n`
		})
		return out
	})
}

export function EmptyState(props = {}) {
	return createView('EmptyState', props, () => {
		const { title = '', description = '' } = props
		let out = '\n'
		const w = Math.max(title.length, description.length, 20)
		out += Logger.style(' '.repeat(Math.floor(w/2) - 1) + '∅\n', { color: Logger.DIM })
		if (title) out += Logger.style(title, { }) + '\n'
		if (description) out += Logger.style(description, { color: Logger.DIM }) + '\n'
		return out
	})
}

export function Header(props = {}) {
	return createView('Header', props, () => {
		const { title = '', links = [] } = props
		let out = '\n'
		out += Logger.style(title, { })
		if (Array.isArray(links) && links.length) {
			out += '  ' + links.map(l => Logger.style(l.label || l.title || l, { color: Logger.CYAN })).join('  ')
		}
		out += '\n' + '═'.repeat(40) + '\n'
		return out
	})
}

export function Footer(props = {}) {
	return createView('Footer', props, () => {
		const { title = '', text = '', links = [] } = props
		let out = '\n' + '─'.repeat(40) + '\n'
		if (title) out += Logger.style(title, { }) + '\n'
		if (text) out += Logger.style(text, { color: Logger.DIM }) + '\n'
		if (Array.isArray(links) && links.length) {
			out += links.map(l => Logger.style(l.label || l.title || l, { color: Logger.DIM })).join(' | ') + '\n'
		}
		return out
	})
}
