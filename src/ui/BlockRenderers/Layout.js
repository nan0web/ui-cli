/**
 * Universal Documentation Blocks - Layout Fallbacks for CLI
 */

export const Layout = {
	Page: (props) => {
		const { title, description, console } = props
		if (console) {
			console.info('\n' + '='.repeat(40))
			if (title) console.info(`  ${title.toUpperCase()}`)
			if (description) console.info(`  ${description}`)
			console.info('='.repeat(40) + '\n')
		}
	},
	Nav: (props) => {
		const { items, console } = props
		if (console && Array.isArray(items)) {
			const links = items.map((i) => (typeof i === 'string' ? i : i.label || i.title)).join(' | ')
			console.info(`[NAV] ${links}\n`)
		}
	},
	Sidebar: (props) => {
		const { items, console } = props
		if (console && Array.isArray(items)) {
			console.info(`\n[SIDEBAR]`)
			items.forEach((i) => {
				const label = typeof i === 'string' ? i : i.label || i.title
				console.info(`  ├─ ${label}`)
			})
			console.info()
		}
	},
}

export default Layout
