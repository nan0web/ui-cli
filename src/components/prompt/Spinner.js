import { createPrompt } from '../../core/Component.js';
import { spinner as baseSpinner } from '../../ui/spinner.js';

/**
 * Spinner Component.
 * Usage: await render(Spinner({ message: 'Loading...', action: promise }))
 */
export function Spinner(props) {
    return createPrompt('Spinner', props, async (p) => {
        const spin = baseSpinner(p.message);
        spin.start();
        if (p.action && p.action.then) {
            try {
                const res = await p.action;
                spin.success(p.successMessage || 'Done');
                return res;
            } catch (err) {
                spin.error(p.errorMessage || 'Error');
                throw err;
            }
        }
        return spin; // Return controller if no action (legacy behavior)
    });
}
