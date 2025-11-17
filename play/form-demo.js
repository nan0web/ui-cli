/**
 * Form demo – demonstrates the new Form class with a User model.
 *
 * @module play/form-demo
 */

import Logger from "@nan0web/log"
import Form from "../src/ui/form.js"

/**
 * Simple User model with static schema for Form.
 */
class User {
	username
	age
	color

	static username = {
		help: "Unique user name",
		defaultValue: "",
		validate: (input) => /^\w+$/.test(input) ? true : "Invalid username (alphanumeric only)"
	}

	static age = {
		help: "User age",
		type: "number",
		required: true,
		defaultValue: 18,
		validate: (input) => {
			const num = Number(input)
			return num >= 18 ? true : "Age must be 18 or older"
		}
	}

	static color = {
		help: "Favorite color",
		options: ["Red", "Green", "Blue"],
		defaultValue: "Red",
		validate: (input) => ["Red", "Green", "Blue"].includes(input) ? true : "Invalid color"
	}

	constructor(input = {}) {
		const {
			username = this.constructor.username.defaultValue,
			age = this.constructor.age.defaultValue,
			color = this.constructor.color.defaultValue,
		} = input
		this.username = String(username)
		this.age = Number(age)
		this.color = String(color)
	}
}

/**
 * Run the form demo using CLIInputAdapter for input.
 *
 * @param {Logger} console - Logger instance.
 * @param {import("../src/InputAdapter.js").default} adapter - Input adapter for prompts.
 */
export async function runFormDemo(console, adapter) {
	console.clear()
	console.success("Form Demo – Using Custom Form Class")

	// Create initial user from env or defaults
	const initialUsername = process.env.USER_USERNAME || ""
	const user = new User({ username: initialUsername })

	// Create handler with stops, bound to adapter for predefined
	const handler = adapter.createHandler(["quit", "cancel", "exit"])

	// Use our Form class
	const form = new Form(user, { inputFn: handler })

	console.info("Filling user form... (uses predefined sequence if set)")

	try {
		const result = await form.requireInput()
		if (result.cancelled) {
			console.info("Form cancelled by user.")
			return
		}

		console.success("Form completed successfully!")
		console.info(`User: ${form.body.username}, Age: ${form.body.age}, Color: ${form.body.color}`)
	} catch (error) {
		console.error(`Form error: ${error.message}`)
	}
}
