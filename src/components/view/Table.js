import { createPrompt } from '../../core/Component.js'
import { table as baseTable } from '../../ui/table.js'

/**
 * Table Component.
 * Can be static (display only) or interactive (filter/select).
 */
export function Table(props) {
	return createPrompt('Table', props, async (p) => {
		return await baseTable(p)
	})
}
