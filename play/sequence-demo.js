#!/usr/bin/env node
/**
 * Simple demo script used by PlaygroundTest unit tests.
 *
 * It reads each line from stdin, prints it prefixed with "Received:",
 * and exits when stdin is closed.
 */
import readline from 'node:readline'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
})

rl.on('line', (line) => {
	console.log(`Received: ${line}`)
})

rl.on('close', () => {
	process.exit(0)
})
