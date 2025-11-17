/** @typedef {import("../InputAdapter.js").default} InputAdapter */

/**
 * Alert component for CLI rendering.
 *
 * @this {InputAdapter}
 * @param {Object} input - Component props.
 * @param {string} [input.variant="info"] - Alert variant (maps to console method).
 * @param {string} [input.content=""] - Alert message content.
 * @throws {Error} If variant maps to undefined console method.
 */
export default function (input = {}) {
	const {
		variant = "info",
		content = "",
	} = input
	const fn = variant === "success" ? "info" : variant
	if (typeof this.console[fn] !== "function") {
		throw new Error(`Undefined variant: ${variant}`)
	}
	this.console[fn](content)
}
