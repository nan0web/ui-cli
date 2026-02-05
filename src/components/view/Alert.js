import { createView } from '../../core/Component.js';
import Logger from '@nan0web/log';
import { beep } from '../../ui/input.js';

/**
 * Alert View Component.
 *
 * @param {Object} props
 * @param {string} props.title - Title of the alert.
 * @param {string} props.children - Message content.
 * @param {'info'|'success'|'warning'|'error'} [props.variant='info'] - Style variant.
 * @param {string} [props.message] - Alias for children (legacy support).
 * @param {boolean} [props.sound] - Play sound (side-effect during toString is acceptable here as it invokes on print).
 */
export function Alert(props) {
	// Normalize props (allow string argument as children shorthand)
	const defaults = { title: '', children: '', variant: 'info' };

	// If props is string, treat as children, otherwise merge with defaults
	const safeProps = typeof props === 'string'
		? { ...defaults, children: props }
		: { ...defaults, ...props };

	const {
		title,
		children,
		message = children,
		variant
	} = safeProps;

	return createView('Alert', props, () => {
		// Logic extracted from old alert.js
		const sound = props.sound || (variant === 'error' || variant === 'warning');

		// Note: beep() is technically a side effect.
		// In "toString" pattern, side effects happen when string conversion receives focus.
		// It's acceptable for sound, but we should be careful.
		if (sound) beep();

		const colors = {
			info: Logger.CYAN,
			success: Logger.GREEN,
			warning: Logger.YELLOW,
			error: Logger.RED
		};

		const color = colors[variant] || Logger.WHITE;
		const icon = {
			info: 'ℹ',
			success: '✔',
			warning: '⚠',
			error: '✖'
		}[variant] || '•';

		const msgStr = String(message || '');
		const lines = msgStr.split('\n');
		const paddedLines = lines.map(line => `   ${line}`);

		// Calculate max line length for border (at least 60 chars or based on content)
		const contentLengths = [
			(title ? title.length + 6 : 0),
			...paddedLines.map(l => l.length)
		];
		const maxContentLen = Math.max(...contentLengths);
		const len = Math.max(60, maxContentLen + 2);

		const border = Logger.style('━'.repeat(len), { color });
		let out = '';

		out += `\n${border}\n`;
		if (title) {
			out += Logger.style(` ${icon} ${title} `, { color }) + ' \n';
			out += Logger.style('─'.repeat(len) + '\n', { color: Logger.DIM });
		}
		lines.forEach(line => {
			if (line.trim()) {
				out += '   ' + Logger.style(line.trim(), { color }) + '\n';
			} else {
				out += '\n';
			}
		});
		out += `${border}\n`;

		return out;
	});
}
