import fs from 'node:fs'
import path from 'node:path'

/**
 * Creates a markdown snapshot tracker for Node.js `node:test` tests.
 * This intercepts `process.stdout.write` and auto-generates a documentation snapshot file.
 *
 * @param {Object} testRunner - The `node:test` exports `{ beforeEach, afterEach, after }`
 * @param {Object} options
 * @param {string} [options.title='CLI TDD Snapshots'] - The title inside the markdown.
 * @param {string} [options.outputPath='./docs/snapshots.md'] - Where to write the generated markdown file.
 * @returns {Object} Methods to retrieve or manage local logs `{ getLogs, clearLogs }`
 */
export function setupSnapshots(testRunner, options = {}) {
	const { beforeEach, afterEach, after } = testRunner
	const { title = 'CLI TDD Snapshots', outputPath = './docs/snapshots.md' } = options

	let originalEnv
	let originalWrite
	let markdownReport = `# ${title}\n\nЦей файл згенерований автоматично як доказ бездоганної роботи інтерфейсу під час TDD циклу.\n\n`
	let localLogs = ''

	beforeEach(() => {
		originalEnv = { ...process.env }
		localLogs = ''
		originalWrite = process.stdout.write
		process.stdout.write = (str) => {
			localLogs += str
			return originalWrite.call(process.stdout, str)
		}
	})

	afterEach((context) => {
		process.env = originalEnv
		process.stdout.write = originalWrite
		const testName = context?.name || 'Unnamed Test'

		markdownReport += '### ' + testName + '\n\n'
		markdownReport += '```ansi\n' + localLogs + '\n```\n\n'
	})

	after(() => {
		const absPath = path.resolve(process.cwd(), outputPath)
		const dir = path.dirname(absPath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
		fs.writeFileSync(absPath, markdownReport, 'utf8')
	})

	return {
		getLogs: () => localLogs,
		clearLogs: () => {
			localLogs = ''
		},
	}
}
