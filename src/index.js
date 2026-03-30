import CLiInputAdapter from './ui/core/InputAdapter.js'
import OutputAdapter from './ui/core/OutputAdapter.js'
import { CancelError } from '@nan0web/ui/core'
import CLI from './ui/CLI.js'
import CommandParser from './ui/core/CommandParser.js'
import CommandHelp from './ui/core/CommandHelp.js'
import Form, { generateForm } from './ui/impl/form.js'

// V2 Component Exports
import { render } from './ui/core/render.js'
import { runGenerator, runApp } from './ui/core/GeneratorRunner.js'
import { resolvePositionalArgs } from './ui/core/resolvePositionalArgs.js'
import { modelFromArgv } from './ui/core/modelFromArgv.js'

// Universal Blocks
import { Layout } from './ui/BlockRenderers/Layout.js'
import { Control } from './ui/BlockRenderers/Control.js'

// Views
import { Alert } from './ui/view/Alert.js'
import { Badge } from './ui/view/Badge.js'
import { Table } from './ui/view/Table.js'
import { Breadcrumbs, Tabs, Steps } from './ui/view/Nav.js'
import { Toast } from './ui/view/Toast.js'
import { Banner, Hero, Pricing, Stats, Timeline, Testimonials, Accordion, Gallery, EmptyState, Header, Footer } from './ui/view/DomainViews.js'

// Prompts
import { Select, SelectModel } from './ui/prompt/Select.js'
import { Input, InputModel } from './ui/prompt/Input.js'
import { Password, PasswordModel } from './ui/prompt/Password.js'
import { Confirm, ConfirmModel } from './ui/prompt/Confirm.js'
import { Multiselect, MultiselectModel } from './ui/prompt/Multiselect.js'
import { Mask, MaskModel } from './ui/prompt/Mask.js'
import { Autocomplete, AutocompleteModel } from './ui/prompt/Autocomplete.js'
import { Slider, SliderModel } from './ui/prompt/Slider.js'
import { Toggle, ToggleModel } from './ui/prompt/Toggle.js'
import { DateTime, DateTimeModel } from './ui/prompt/DateTime.js'
import { Next, NextModel } from './ui/prompt/Next.js'
import { Pause, PauseModel } from './ui/prompt/Pause.js'
import { Tree, TreeModel } from './ui/prompt/Tree.js'
import { Spinner, SpinnerModel } from './ui/prompt/Spinner.js'
import { ProgressBar, ProgressBarModel } from './ui/prompt/ProgressBar.js'
import { Sortable, SortableModel } from './ui/prompt/Sortable.js'

// Legacy utils still needed for internal logic or compat
export { createInput, ask, text } from './ui/impl/input.js'
export { select } from './ui/impl/select.js'
export { confirm } from './ui/impl/confirm.js'
export { next } from './ui/impl/next.js'
export { multiselect } from './ui/impl/multiselect.js'
export { mask } from './ui/impl/mask.js'
export { table } from './ui/impl/table.js'
export { autocomplete } from './ui/impl/autocomplete.js'
export { pause } from './ui/impl/next.js'
export { alert } from './ui/impl/alert.js'
export { badge } from './ui/impl/badge.js'
export { toast } from './ui/impl/toast.js'
export { spinner } from './ui/impl/spinner.js'
export { progress } from './ui/impl/progress.js'
export { breadcrumbs, tabs, steps } from './ui/impl/nav.js'
export { tree } from './ui/impl/tree.js'
export { datetime } from './ui/impl/date-time.js'
export { toggle } from './ui/impl/toggle.js'
export { slider } from './ui/impl/slider.js'
export { sortable } from './ui/impl/sortable.js'

// Public V2 API
export {
	// Core
	render,
	runGenerator,
	runApp,
	resolvePositionalArgs,
	modelFromArgv,
	CLiInputAdapter,
	CancelError,
	Layout,
	Control,

	// Components
	Alert,
	Alert as Message,
	Select as Init, // SANE FALLBACK
	Badge,
	Table,
	Breadcrumbs,
	Tabs,
	Steps,
	Toast,
	Banner,
	Hero,
	Pricing,
	Pricing as PricingSection,
	Stats,
	Timeline,
	Testimonials,
	Accordion,
	Accordion as FAQ,
	Gallery,
	EmptyState,
	Header,
	Footer,
	Select, SelectModel,
	Input, InputModel,
	Password, PasswordModel,
	Confirm, ConfirmModel,
	Multiselect, MultiselectModel,
	Mask, MaskModel,
	Autocomplete, AutocompleteModel,
	Slider, SliderModel,
	Toggle, ToggleModel,
	DateTime, DateTimeModel,
	Next, NextModel,
	Pause, PauseModel,
	Tree, TreeModel,
	Spinner, SpinnerModel,
	ProgressBar, ProgressBarModel,
	Sortable, SortableModel,

	// Tools
	CLI,
	CommandParser,
	CommandHelp,
	OutputAdapter,
	Form,
	generateForm,
}

export { default as Command } from './ui/Command.js'
export { str2argv } from './ui/utils/parse.js'

export default CLiInputAdapter
