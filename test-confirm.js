import { Confirm, ConfirmModel } from './src/index.js';
import { PromptSymbol } from './src/ui/core/Component.js';
const component = Confirm({ message: 'hi' });
console.log("component props UI_YES:", component.props.UI_YES);
component.execute().catch(e => console.error(e));
