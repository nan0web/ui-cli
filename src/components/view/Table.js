import { createPrompt, createView } from '../../core/Component.js'
import { table as baseTable } from '../../ui/table.js'
import Logger from '@nan0web/log'

/**
 * Table Component.
 * Can be static (display only) or interactive (filter/select).
 *
 * When `interactive === false`, returns a synchronous View (stringifiable).
 * Otherwise returns an interactive Prompt for CLI usage.
 */
export function Table(props) {
	if (props.interactive === false) {
		return createView('Table', props, (p) => {
			const logger = new Logger({ level: 'silent', chromo: true })
			// Auto-infer columns from object keys if not provided
			const columns =
				p.columns ||
				(Array.isArray(p.data) &&
				p.data.length > 0 &&
				!Array.isArray(p.data[0]) &&
				typeof p.data[0] === 'object'
					? Object.keys(p.data[0])
					: undefined)
			const lines = logger.table(p.data, columns, { ...p, silent: true })
			const header = p.title ? [p.title] : []
			return [...header, ...lines].join('\n')
		})
	}

	return createPrompt('Table', props, async (p) => {
		return await baseTable(p)
	})
}
