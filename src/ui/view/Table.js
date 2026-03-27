import { createPrompt } from '../core/Component.js'
import { table as baseTable } from '../impl/table.js'
import { TableModel } from '../../domain/view/TableModel.js'

export { TableModel }

/**
 * Interactive data table with filtering.
 * @param {Object} props - Table properties (data, columns, etc).
 */
export function Table(props) {
	const model = new TableModel(props)

	return createPrompt('Table', model, async (p) => {
		const t = p.t || ((k) => k)
		return await baseTable({
			...p,
			title: p.UI,
			filterMsg: t(TableModel.UI_FILTER),
			noneMsg: t(TableModel.UI_NONE),
			filterPrompt: t(TableModel.UI_FILTER_PROMPT),
		})
	})
}
