import { createPrompt } from '../core/Component.js'
import { datetime } from '../impl/date-time.js'
import { DateTimeModel } from '../../domain/prompt/DateTimeModel.js'

export { DateTimeModel }

/**
 * Interactive Date and Time picker.
 * @param {Object|string} props - Configuration or message.
 */
export function DateTime(props) {
	const model = new DateTimeModel(props)
	return createPrompt('DateTime', model, async (p) => {
		const initialDate = p.initial instanceof Date ? p.initial : new Date(p.initial || Date.now())

		return await datetime({
			...p,
			message: p.UI,
			initial: initialDate
		})
	})
}
