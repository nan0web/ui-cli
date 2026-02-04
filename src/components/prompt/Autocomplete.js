import { createPrompt } from '../../core/Component.js';
import { autocomplete as baseAutocomplete } from '../../ui/autocomplete.js';

export function Autocomplete(props) {
    return createPrompt('Autocomplete', props, async (p) => {
        return await baseAutocomplete({
            message: p.message || p.title,
            options: p.options,
            limit: p.limit
        });
    });
}
