import { createPrompt } from '../../core/Component.js'
import { progress as baseProgress } from '../../ui/progress.js'

/**
 * ProgressBar Component.
 * usage:
 * const bar = await render(ProgressBar({ total: 100 }));
 * bar.update(50);
 */
export function ProgressBar(props) {
	return createPrompt('ProgressBar', props, async (p) => {
		const bar = baseProgress(p)
		// If action is provided, we could auto-run it, but progress bars usually strictly driven
		return bar
	})
}
