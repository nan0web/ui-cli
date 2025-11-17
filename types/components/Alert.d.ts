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
export default function _default(this: import("../InputAdapter.js").default, input?: {
    variant?: string | undefined;
    content?: string | undefined;
}): void;
export type InputAdapter = import("../InputAdapter.js").default;
