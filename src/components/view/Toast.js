import { createView } from '../../core/Component.js';
import { toast as baseToast } from '../../ui/toast.js';

export function Toast(props) {
    if (typeof props === 'string') props = { message: props, variant: 'info' };
    return createView('Toast', props, (p) => {
        return baseToast(p.message, p.variant);
    });
}
