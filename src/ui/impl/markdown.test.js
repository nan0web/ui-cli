import { describe, it } from 'node:test'
import assert from 'node:assert'
import { renderMarkdown } from './markdown.js'

describe('Markdown render', () => {
	const input = [
		'# Header 1',
		'## Header 2',
		'### Header 3',
		'#### Header 4',
		'##### Header 5',
		'###### Header 6',
		'![Image](and/its/location.svg)',
		'',
		'[Link](https://and.its.location)',
		'',
		'- Apple',
		'- Banana',
		'- Pineapple',
		'```bash',
		'export Some="VALUE"',
		'```',
		'',
		'---',
		'1. One',
		'1. Two',
		'1. Three',
	].join('\n')
	it('should properly render gutters', () => {
		const str = renderMarkdown(input)
		assert.deepStrictEqual(str.split('\n'), [
			'#   | Header 1',
			'    | ',
			'##  | Header 2',
			'    | ',
			'#3  | Header 3',
			'    | ',
			'#4  | Header 4',
			'    | ',
			'#5  | Header 5',
			'    | ',
			'#6  | Header 6',
			'    | ',
			'    | ![Image](and/its/location.svg)',
			'    | ',
			'    | [Link](https://and.its.location)',
			'    | ',
			'{}  | export Some="VALUE"',
			'    | ',
			'    | ',
		])
	})
})
