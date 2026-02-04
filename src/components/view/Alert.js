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
        let out = '';

        // Simple calculation for border length
        // We strip ANSI codes for length calculation if needed,
        // but here we assume message is clean text usually.
        const len = msgStr.length + 4;
        const border = Logger.style('━'.repeat(len), { color });

        out += `\n${border}\n`;
        if (title) {
            out += Logger.style(` ${icon} ${title} \n`, { color });
            out += Logger.style('─'.repeat(len) + '\n', { color: Logger.DIM });
        }
        out += Logger.style(` ${msgStr} `, { color });
        out += `\n${border}\n`;

        return out;
    });
}
