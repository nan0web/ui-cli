import { createPrompt } from '../../core/Component.js';
import { multiselect as baseMultiselect } from '../../ui/multiselect.js';

export function Multiselect(props) {
    return createPrompt('Multiselect', props, async (p) => {
        return await baseMultiselect({
            message: p.message || p.label,
            options: p.options,
            limit: p.limit,
            initial: p.initial,
            instructions: p.instructions
        });
    });
}
