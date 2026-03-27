import { createPrompt } from '../core/Component.js'
import { autocomplete } from '../impl/autocomplete.js'
import { AutocompleteModel } from '../../domain/prompt/AutocompleteModel.js'

export { AutocompleteModel }

/**
 * Searchable input with suggestions.
 * @param {Object|string} props - Configuration or message.
 */
export function Autocomplete(props) {
	const model = new AutocompleteModel(props)
	return createPrompt('Autocomplete', model, async (p) => {
		return await autocomplete({
			...p,
			message: p.UI,
			hint: p.t ? p.t(p.UI_HINT) : p.UI_HINT
		})
	})
}
