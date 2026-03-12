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
export function setupSnapshots(testRunner: any, options?: {
    title?: string | undefined;
    outputPath?: string | undefined;
}): any;
