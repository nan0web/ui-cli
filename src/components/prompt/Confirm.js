import { createPrompt } from '../../core/Component.js';
import { confirm as baseConfirm } from '../../ui/confirm.js';

export function Confirm(props) {
    return createPrompt('Confirm', props, async (p) => {
        return await baseConfirm({
            message: p.message || p.children,
            initial: p.initial
        });
    });
}
