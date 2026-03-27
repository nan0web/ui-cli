/**
 * Domain Views Demo – showcases Banner, Hero, Pricing, Stats,
 * Timeline, Testimonials, Accordion, Gallery, EmptyState, Header, Footer.
 *
 * @module play/domain-views-demo
 */

import { render } from '../src/index.js'
import {
	Banner, Hero, Pricing, Stats, Timeline,
	Testimonials, Accordion, Gallery, EmptyState, Header, Footer,
} from '../src/ui/view/DomainViews.js'

/**
 * Run the domain views demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runDomainViewsDemo(console, adapter, t) {
	console.clear()
	console.success(t('Domain Views Demo'))

	// Header
	console.info('\n--- HEADER ---')
	await render(Header({ title: t('My Application'), links: [{ label: t('Home') }, { label: t('About') }, { label: t('Contact') }] }))

	// Hero
	console.info('\n--- HERO ---')
	await render(Hero({ title: t('Welcome to NaN•Web'), description: t('One Logic — Many UIs') }))

	// Banner
	console.info('\n--- BANNER ---')
	await render(Banner({ text: t('New Release Available!') }))

	// Stats
	console.info('\n--- STATS ---')
	await render(Stats({
		title: t('Dashboard Metrics'),
		items: [
			{ label: t('Users'), value: '12,450', trend: 1 },
			{ label: t('Revenue'), value: '$84,200', trend: 1 },
			{ label: t('Errors'), value: '3', trend: -1 },
		],
	}))

	// Pricing
	console.info('\n--- PRICING ---')
	await render(Pricing({
		items: [
			{ title: t('Free'), price: '$0', features: [t('1 Project'), t('Basic Support')] },
			{ title: t('Pro'), price: '$29', popular: true, features: [t('Unlimited Projects'), t('Priority Support'), t('API Access')] },
			{ title: t('Enterprise'), price: t('Custom'), features: [t('Dedicated Server'), t('SLA'), t('Custom Integration')] },
		],
	}))

	// Timeline
	console.info('\n--- TIMELINE ---')
	await render(Timeline({
		items: [
			{ date: '2026-01-15', title: t('Project Started'), description: t('Initial commit and architecture design') },
			{ date: '2026-02-20', title: t('Beta Release'), description: t('First public beta with core features') },
			{ date: '2026-03-27', title: t('v1.0 Launch'), description: t('Production-ready release') },
		],
	}))

	// Testimonials
	console.info('\n--- TESTIMONIALS ---')
	await render(Testimonials({
		items: [
			{ text: t('Amazing framework! Reduced our dev time by 70%.'), author: 'Alice', rating: 5 },
			{ text: t('The CLI-first approach is brilliant.'), author: 'Bob', rating: 4 },
		],
	}))

	// Accordion (FAQ)
	console.info('\n--- ACCORDION ---')
	await render(Accordion({
		items: [
			{ title: t('What is OLMUI?'), answer: t('One Logic — Many UIs. Write once, render everywhere.') },
			{ title: t('Is it open source?'), answer: t('Yes, ISC license.') },
		],
	}))

	// Gallery
	console.info('\n--- GALLERY ---')
	await render(Gallery({
		items: [
			{ src: 'https://example.com/screenshot1.webp' },
			{ src: 'https://example.com/screenshot2.webp' },
			'https://example.com/logo.png',
		],
	}))

	// EmptyState
	console.info('\n--- EMPTY STATE ---')
	await render(EmptyState({ title: t('No Results'), description: t('Try adjusting your search criteria.') }))

	// Footer
	console.info('\n--- FOOTER ---')
	await render(Footer({
		title: t('NaN•Web'),
		text: t('© 2026 All rights reserved'),
		links: [{ label: t('Privacy') }, { label: t('Terms') }, { label: t('GitHub') }],
	}))

	await adapter.pause(t('Press any key to continue...'))
}
