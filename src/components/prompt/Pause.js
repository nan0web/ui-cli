import { createPrompt } from '../../core/Component.js';
import { pause } from '../../ui/next.js';

export function Pause(props) {
	if (typeof props === 'number') props = { ms: props };
	return createPrompt('Pause', props, async (p) => {
		return await pause(p.ms || 1000);
	});
}
