import { createPrompt } from '../core/Component.js'
import { tree } from '../impl/tree.js'
import { TreeModel } from '../../domain/prompt/TreeModel.js'

export { TreeModel }

/**
 * Tree navigation/selection prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Tree(props) {
	const model = new TreeModel(props)

	return createPrompt('Tree', model, async (p) => {
		const t = p.t || ((k) => k)
		return await tree({
			...p,
			message: p.UI,
			hint: t(p.UI_HINT),
			empty: t(TreeModel.UI_EMPTY),
			loading: t(TreeModel.UI_LOADING),
			selected: t(TreeModel.UI_SELECTED),
		})
	})
}
