/**
 * PlaygroundTest – utilities for automated stdin sequence testing.
 *
 * @module PlaygroundTest
 */

import { spawn } from "node:child_process"
import event, { EventContext } from "@nan0web/event"

/**
 * @typedef {object} PlaygroundTestConfig
 * @property {NodeJS.ProcessEnv} env Environment variables for the child process.
 * @property {{ includeDebugger?: boolean }} [config={}] Configuration options.
 */

/**
 * Utility class to run playground demos and capture output.
 *
 * Updated behaviour:
 *   – When `PLAY_DEMO_SEQUENCE` is defined, the values are streamed to the
 *     child process **after** each prompt appears.  This guarantees that the
 *     first value is consumed by the first `select` (demo menu) and the
 *     subsequent values are consumed by the following prompts (e.g. colour
 *     selection, UI‑CLI demo, exit).
 *   – A modest delay (≈ 200 ms) between writes gives the child process time to
 *     render the prompt and start listening for input, eliminating race
 *     conditions that caused the previous implementation to feed the next value
 *     too early (resulting in the wrong option being selected).
 */
export default class PlaygroundTest {
	#bus
	/**
	 * @param {NodeJS.ProcessEnv} env Environment variables for the child process.
	 * @param {{ includeDebugger?: boolean }} [config={}] Configuration options.
	 */
	constructor(env, config = {}) {
		this.env = env
		this.#bus = event()
		/** @type {boolean} Include debugger lines in output (default: false). */
		this.includeDebugger = config.includeDebugger ?? false
	}

	/**
	 * Subscribe to an event.
	 */
	on(event, fn) {
		this.#bus.on(event, fn)
	}
	/**
	 * Unsubscribe from an event.
	 */
	off(event, fn) {
		this.#bus.off(event, fn)
	}
	/**
	 * Emit an event.
	 */
	async emit(event, data) {
		return await this.#bus.emit(event, data)
	}
	/**
	 * Filter debugger related lines.
	 */
	filterDebugger(str) {
		if (this.includeDebugger) return str
		const words = ["debugger", "https://nodejs.org/en/docs/inspector"]
		return str
			.split("\n")
			.filter(s => !words.some(w => s.toLowerCase().includes(w)))
			.join("\n")
	}
	/**
	 * Slice lines from stdout or stderr.
	 */
	slice(target, start, end) {
		const txt = (this.recentResult?.[target] ?? "")
		return txt.split("\n").slice(start, end)
	}
	/**
	 * Write the answer sequence to the child process **asynchronously**,
	 * waiting a short period after each prompt appears.
	 *
	 * @param {any} child – ChildProcess instance.
	 */
	async #feedSequence(child) {
		const raw = this.env.PLAY_DEMO_SEQUENCE
		if (!raw) return

		const sequence = raw.split(",").map(s => s.trim()).filter(Boolean)
		if (sequence.length === 0) return

		if (child.stdin) child.stdin.setDefaultEncoding("utf-8")

		const writeNext = (idx) => {
			if (idx >= sequence.length) {
				child.stdin?.end()
				return
			}
			setTimeout(() => {
				if (!child.killed && child.stdin?.writable) {
					child.stdin.write(`${sequence[idx]}\n`)
					writeNext(idx + 1)
				}
			}, 200)
		}
		writeNext(0)
	}
	/**
	 * Executes the playground script.
	 *
	 * @param {string[]} [args=["play/main.js"]] Arguments passed to the node process.
	 */
	async run(args = ["play/main.js"]) {
		const child = spawn("node", args, {
			env: this.env,
			stdio: ["pipe", "pipe", "pipe"],
		})

		this.#feedSequence(child)

		let stdout = ""
		for await (const chunk of child.stdout) {
			stdout += chunk.toString()
			this.emit("stdout", { chunk })
		}

		let stderr = ""
		for await (const chunk of child.stderr) {
			const clean = this.filterDebugger(chunk.toString())
			stderr += clean
			this.emit("stderr", { chunk, clean })
		}

		const exitCode = await new Promise(resolve => child.on("close", resolve))
		this.recentResult = { stdout, stderr, exitCode }
		return this.recentResult
	}
}