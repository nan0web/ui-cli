import CLiInputAdapter from './InputAdapter.js';
import OutputAdapter from './OutputAdapter.js';
import { CancelError } from '@nan0web/ui/core';
import CLI from './CLI.js';
import CommandParser from './CommandParser.js';

// V2 Component Exports
import { render } from './core/render.js';

// Views
import { Alert } from './components/view/Alert.js';
import { Badge } from './components/view/Badge.js';
import { Table } from './components/view/Table.js';
import { Breadcrumbs, Tabs, Steps } from './components/view/Nav.js';
import { Toast } from './components/view/Toast.js';

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
import { DateTime } from './components/prompt/DateTime.js';
import { Next } from './components/prompt/Next.js';
import { Pause } from './components/prompt/Pause.js';
import { Tree } from './components/prompt/Tree.js';
import { Spinner } from './components/prompt/Spinner.js';
import { ProgressBar } from './components/prompt/ProgressBar.js';

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
	Breadcrumbs,
	Tabs,
	Steps,
	Toast,

	Select,
	Input,
	Password,
	Confirm,
	Multiselect,
	Mask,
	Autocomplete,
	Slider,
	Toggle,
	DateTime,
	Next,
	Pause,
	Tree,
	Spinner,
	ProgressBar,

	// Tools
	CLI,
	CommandParser,
	OutputAdapter
};

export default CLiInputAdapter;
