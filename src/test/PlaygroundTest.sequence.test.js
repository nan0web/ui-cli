import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { PlaygroundTest } from "../test/index.js"
import path from "node:path"

describe("PlaygroundTest – automated stdin sequence", () => {
	it("feeds PLAY_DEMO_SEQUENCE values to child process stdin", async () => {
		const script = path.join(process.cwd(), "play", "sequence-demo.js")
		const env = { ...process.env, PLAY_DEMO_SEQUENCE: "hello,world" }

		const pt = new PlaygroundTest(env, { includeDebugger: true })
		const result = await pt.run([script])

		const lines = result.stdout
			.trim()
			.split("\n")
			.filter((l) => l.length > 0)

		assert.deepStrictEqual(lines, ["Received: hello", "Received: world"])
		assert.strictEqual(result.exitCode, 0)
	})
})