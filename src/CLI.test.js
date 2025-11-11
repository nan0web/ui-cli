import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { InputMessage, OutputMessage } from "@nan0web/co"
import CLI from "./CLI.js"

class EchoCLI extends CLI {
	constructor(input = {}) {
		super(input)
		this.commands.set("echo", this.echo.bind(this))
	}
	async * echo(msg) {
		yield new OutputMessage({ content: [`Echo: ${msg.value.body.text}`] })
	}
}

describe("CLI", () => {
	it("initialises with defaults", () => {
		const cli = new CLI()
		assert.ok(cli instanceof CLI)
		assert.deepStrictEqual(cli.argv, [])
		assert.ok(cli.commands instanceof Map)
		assert.ok(cli.logger)
	})

	it("initialises with custom argv", () => {
		const args = ["--verbose", "command"]
		const cli = new CLI({ argv: args })
		assert.deepStrictEqual(cli.argv, args)
	})

	it("detects logger level from argv", () => {
		const cli = new CLI({ argv: ["--debug"] })
		assert.equal(cli.logger.level, "debug")
	})

	it("adds help command automatically", () => {
		const cli = new CLI()
		assert.ok(cli.commands.has("help"))
	})

	it("runs help command and yields available commands", async () => {
		const cli = new CLI()
		cli.commands.set("test", async function* () {
			yield new OutputMessage({ content: ["Test command output"] })
		})

		const msg = new InputMessage({ value: { body: { command: "help" } } })
		const results = []
		for await (const out of cli.run(msg)) results.push(out)

		assert.equal(results.length, 1)
		const content = results[0].content
		assert.ok(Array.isArray(content))
		const full = content.join("\n")
		assert.ok(full.includes("Available commands"))
		assert.ok(full.includes("help"))
		assert.ok(full.includes("test"))
	})

	it("runs registered command", async () => {
		const cli = new EchoCLI()
		const msg = new InputMessage({
			value: { body: { command: "echo", text: "hello" } },
		})
		const results = []
		for await (const out of cli.run(msg)) results.push(out)

		assert.equal(results.length, 1)
		assert.equal(results[0].content[0], "Echo: hello")
	})

	it("handles unknown command", async () => {
		const cli = new CLI()
		const msg = new InputMessage({
			value: { body: { command: "unknown" } },
		})
		const results = []
		for await (const out of cli.run(msg)) results.push(out)

		assert.equal(results.length, 1)
		assert.equal(results[0].content, "Unknown command: unknown")
	})

	it("creates CLI instance from object", () => {
		const cli = CLI.from({ argv: ["test"] })
		assert.ok(cli instanceof CLI)
		assert.deepStrictEqual(cli.argv, ["test"])
	})

	it("returns same instance if already CLI", () => {
		const original = new CLI()
		const copy = CLI.from(original)
		assert.equal(copy, original)
	})
})