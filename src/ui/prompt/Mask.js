import { createPrompt } from '../core/Component.js'
import { mask } from '../impl/mask.js'
import { MaskModel } from '../../domain/prompt/MaskModel.js'

export { MaskModel }

/**
 * Formatted mask input (e.g., phone, credit card).
 * @param {Object|string} props - Configuration or message.
 */
export function Mask(props) {
	const model = new MaskModel(props)
	return createPrompt('Mask', model, async (p) => {
		return await mask({
			...p,
			message: p.UI,
			formatMsg: p.t ? p.t(p.UI_FORMAT_MSG) : p.UI_FORMAT_MSG
		})
	})
}
