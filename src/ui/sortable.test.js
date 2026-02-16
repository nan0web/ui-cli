/**
 * Sortable unit tests.
 *
 * Tests the formatting and SortableList integration.
 * Interactive stdin tests are covered by play/ integration tests.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Component } from '@nan0web/ui'

const SortableList = Component.SortableList

describe('Sortable — unit', () => {
	/**
	 * @contract SortableList headless model must be importable from @nan0web/ui
	 */
	it('SortableList is accessible via Component.SortableList', () => {
		assert.ok(SortableList, 'SortableList must be defined')
		assert.equal(typeof SortableList.create, 'function')
	})

	/**
	 * @contract SortableList.create({ items }) returns instance with expected API
	 */
	it('SortableList.create() returns instance with full API', () => {
		const list = SortableList.create({ items: ['a', 'b', 'c'] })
		assert.equal(typeof list.moveUp, 'function')
		assert.equal(typeof list.moveDown, 'function')
		assert.equal(typeof list.moveTo, 'function')
		assert.equal(typeof list.getItems, 'function')
		assert.equal(typeof list.reset, 'function')
	})

	/**
	 * @contract moveUp(1) swaps index 1 and 0
	 */
	it('moveUp swaps adjacent items', () => {
		const list = SortableList.create({ items: ['x', 'y', 'z'] })
		list.moveUp(1)
		assert.deepStrictEqual(list.getItems(), ['y', 'x', 'z'])
	})

	/**
	 * @contract moveDown(0) swaps index 0 and 1
	 */
	it('moveDown swaps adjacent items', () => {
		const list = SortableList.create({ items: ['x', 'y', 'z'] })
		list.moveDown(0)
		assert.deepStrictEqual(list.getItems(), ['y', 'x', 'z'])
	})

	/**
	 * @contract moveTo(0, 2) drag-n-drops first item to third position
	 */
	it('moveTo drags item to new position', () => {
		const list = SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveTo(0, 2)
		assert.deepStrictEqual(list.getItems(), ['b', 'c', 'a'])
	})

	/**
	 * @contract reset() restores initial order
	 */
	it('reset restores initial order', () => {
		const list = SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveUp(2)
		list.moveUp(1)
		list.reset()
		assert.deepStrictEqual(list.getItems(), ['a', 'b', 'c'])
	})

	/**
	 * @contract onChange fires on each mutation
	 */
	it('onChange callback fires on mutations', () => {
		const calls = []
		const list = SortableList.create({
			items: ['a', 'b', 'c'],
			onChange: (items) => calls.push([...items]),
		})
		list.moveUp(1)
		list.moveDown(1)
		assert.equal(calls.length, 2)
	})

	/**
	 * @contract Boundary: moveUp(0) is no-op
	 */
	it('moveUp(0) does not change order', () => {
		const list = SortableList.create({ items: ['a', 'b'] })
		list.moveUp(0)
		assert.deepStrictEqual(list.getItems(), ['a', 'b'])
	})

	/**
	 * @contract Boundary: moveDown(last) is no-op
	 */
	it('moveDown(last) does not change order', () => {
		const list = SortableList.create({ items: ['a', 'b'] })
		list.moveDown(1)
		assert.deepStrictEqual(list.getItems(), ['a', 'b'])
	})

	/**
	 * @contract sortable module exports the function
	 */
	it('sortable module exports function', async () => {
		const { sortable } = await import('./sortable.js')
		assert.equal(typeof sortable, 'function')
	})

	/**
	 * @contract sortable throws on empty items
	 */
	it('sortable rejects empty items array', async () => {
		const { sortable } = await import('./sortable.js')
		await assert.rejects(() => sortable({ message: 'Sort', items: [] }), {
			message: 'Items array is required and must not be empty',
		})
	})

	/**
	 * @contract Sortable Component exists and creates a prompt
	 */
	it('Sortable component creates a prompt descriptor', async () => {
		const { Sortable } = await import('../components/prompt/Sortable.js')
		const desc = Sortable({
			message: 'Reorder',
			items: ['a', 'b', 'c'],
		})
		assert.equal(desc.type, 'Sortable')
		assert.equal(typeof desc.execute, 'function')
	})
})
