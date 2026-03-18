import { createPrompt } from '../../core/Component.js'
import { mask as baseMask } from '../../ui/mask.js'
/**
 * @param {Object} props
 * @param {string} props.message
 * @param {string} props.mask
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 */
export function Mask(props) {
	return createPrompt('Mask', props, async (p) => {
		return await baseMask({
			message: p.message || p.label,
			mask: p.mask,
			placeholder: p.placeholder,
		})
	})
}
