import { createPrompt } from '../../core/Component.js';
import { tree } from '../../ui/tree.js';

export function Tree(props) {
	return createPrompt('Tree', props, async (p) => {
		return await tree({
			message: p.message || p.title,
			mode: p.mode,
			tree: p.tree || p.options || p.data,
			loader: p.loader,
			limit: p.limit,
			initialExpanded: p.expanded,
			multiselect: p.multiselect,
			t: p.t
		});
	});
}
