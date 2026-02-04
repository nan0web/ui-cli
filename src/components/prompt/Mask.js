import { createPrompt } from '../../core/Component.js';
import { mask as baseMask } from '../../ui/mask.js';

export function Mask(props) {
    return createPrompt('Mask', props, async (p) => {
        return await baseMask({
            message: p.message || p.label,
            mask: p.mask,
            placeholder: p.placeholder
        });
    });
}
