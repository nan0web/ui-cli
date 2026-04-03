import test from 'node:test'
import assert from 'node:assert/strict'
import { Pricing, Gallery, Testimonials, EmptyState, Banner } from '../../../../../../src/ui/view/DomainViews.js'
import CLiInputAdapter from '../../../../../../src/ui/core/InputAdapter.js'
import Logger from '@nan0web/log'
import fs from 'node:fs'
import path from 'node:path'

/**
 * @release v2.10.0
 * @contract Testing Domain Views Aesthetics & Agnostic Intent Handlers
 */

test('Release v2.10.0: Pricing component aesthetics', () => {
	const t = (k) => k
	const props = {
		title: 'Pro Plan',
		items: [{
			title: 'Pro',
			price: '$10',
			features: ['Unlimited', 'Support']
		}]
	}
	const view = Pricing.call({ t }, props)
	const out = String(view)
	
	assert.ok(out.includes('PRO PLAN'), 'Title should be uppercase')
	assert.ok(out.includes('│'), 'Should have vertical line for features')
	assert.ok(out.includes('✓'), 'Should have checkmark')
})

test('Release v2.10.0: Testimonials rating colors', () => {
	const t = (k) => k
	const props = {
		items: [{ content: 'Great!', rating: 5, author: 'Yaroslav' }]
	}
	const view = Testimonials.call({ t }, props)
	const out = String(view)
	
	assert.ok(out.includes(Logger.YELLOW), 'Should have yellow color for stars')
	assert.ok(out.includes('★★★★★'), 'Should have 5 stars')
})

test('Release v2.10.0: EmptyState icon centering', () => {
    const t = (k) => k
    const props = { title: 'No results found', description: 'Try another search' }
    const view = EmptyState.call({ t }, props)
    const out = String(view)
    
    // Icon (∅) should have some padding
    assert.ok(out.includes(' ∅'), 'Icon should have some leading padding for centering')
})

test('Release v2.10.0: Gallery iTerm2 support (Mocked Terminal)', async (t) => {
	const adapterMock = { t: (k) => k }
  
    // Create a dummy file to trigger fs.existsSync check
    const tmpFile = path.resolve(process.cwd(), 'release_test_gallery.jpg')
    fs.writeFileSync(tmpFile, 'dummy jpg content')

	// Mock process.env
	const oldTerm = process.env.TERM_PROGRAM
	process.env.TERM_PROGRAM = 'iTerm.app'

	try {
        // We MUST use path that exists. 
		const view = Gallery.call(adapterMock, { items: [tmpFile] })
		const out = String(view)
		
		assert.ok(out.includes('\x1b]1337;File='), 'Should use iTerm2 Inline Image protocol')
	} finally {
		process.env.TERM_PROGRAM = oldTerm
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
	}
})

test('Release v2.10.0: CLiInputAdapter OLMUI intents', () => {
	const adapter = new CLiInputAdapter()
	
	assert.strictEqual(typeof adapter.ask, 'function', 'Should have ask method')
	assert.strictEqual(typeof adapter.log, 'function', 'Should have log method')
	assert.strictEqual(typeof adapter.progress, 'function', 'Should have progress method')
	assert.strictEqual(typeof adapter.result, 'function', 'Should have result method')
})

test('Release v2.10.0: I18n context passing in Banner', () => {
    let capturedContext = null
    const tFn = (key, context) => {
        capturedContext = context
        return key
    }
    const props = { text: 'Hello', foo: 'bar' }
    String(Banner.call({ t: tFn }, props))
    
    assert.ok(capturedContext, 'Context should be passed to t()')
    assert.strictEqual(capturedContext.foo, 'bar', 'Context properties should persist')
})
