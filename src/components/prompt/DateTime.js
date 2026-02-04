import { createPrompt } from '../../core/Component.js';
import { datetime as baseDateTime } from '../../ui/date-time.js';

export function DateTime(props) {
    return createPrompt('DateTime', props, async (p) => {
        return await baseDateTime({
            message: p.message || p.label,
            initial: p.initial,
            mask: p.mask,
            t: p.t
        });
    });
}
