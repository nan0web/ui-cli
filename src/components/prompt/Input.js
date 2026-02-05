import { createPrompt } from '../../core/Component.js';
import { text } from '../../ui/input.js';

export function Input(props) {
	return createPrompt('Input', props, async (p) => {
		const config = {
			message: p.message || p.label,
			initial: p.initial || p.defaultValue,
			type: p.type || 'text',
			validate: p.validate || p.validator,
			format: p.format
		};
		return await text(config);
	});
}
