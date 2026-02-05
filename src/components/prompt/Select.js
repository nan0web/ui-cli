import { createPrompt } from '../../core/Component.js';
import { select } from '../../ui/select.js';

/**
 * Select Prompt Component.
 *
 * @param {Object} props
 * @param {string} props.message - Question/Title.
 * @param {Array} props.options - Options list.
 * @param {number} [props.limit] - Max visible options.
 */
export function Select(props) {
	return createPrompt('Select', props, async (p) => {
		// Map props to legacy select config
		// New API uses 'message', 'children'?, 'options'
		// Legacy used 'title', 'prompt', 'options'

		const config = {
			title: p.title || p.message, // Support both
			options: p.options || p.children, // Support children as options?
			limit: p.limit,
			hint: p.hint || (p.t ? p.t('hint.select') : undefined),
			// Pass other potential legacy props
			...p
		};

		return await select(config);
	});
}
