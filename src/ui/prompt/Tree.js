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
		const hint = p.UI_HINT ? t(p.UI_HINT) : (p.multiple ? t(TreeModel.UI_HINT_MULTI.default) : t(TreeModel.UI_HINT_SINGLE.default))

		return await tree({
			...p,
			message: p.UI,
			hint,
			empty: t(TreeModel.UI_EMPTY.default),
			loading: t(TreeModel.UI_LOADING.default),
			selected: t(TreeModel.UI_SELECTED.default),
		})
	})
}
