import { CLiInputAdapter, CancelError, OutputAdapter, CLI, CommandParser } from './index.js';

// V2 Component Exports
import { render } from './core/render.js';

// Views
import { Alert } from './components/view/Alert.js';
import { Badge } from './components/view/Badge.js';
import { Table } from './components/view/Table.js';

// Prompts
import { Select } from './components/prompt/Select.js';
import { Input } from './components/prompt/Input.js';
import { Password } from './components/prompt/Password.js';
import { Confirm } from './components/prompt/Confirm.js';
import { Multiselect } from './components/prompt/Multiselect.js';
import { Mask } from './components/prompt/Mask.js';
import { Autocomplete } from './components/prompt/Autocomplete.js';
import { Slider } from './components/prompt/Slider.js';
import { Toggle } from './components/prompt/Toggle.js';

// Legacy utils still needed for internal logic or compat
export { createInput, ask, text } from './ui/input.js';
export { select } from './ui/select.js';

// Public V2 API
export {
	// Core
	render,
	CLiInputAdapter,
	CancelError,

	// Components
	Alert,
	Badge,
	Table,
	Select,
	Input,
	Password,
	Confirm,
	Multiselect,
	Mask,
	Autocomplete,
	Slider,
	Toggle,

	// Tools
	CLI,
	CommandParser
};

export default CLiInputAdapter;
