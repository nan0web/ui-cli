/**
 * Basic boolean toggle switch.
 * @param {Object|string} props - Configuration or message.
 */
export function Toggle(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { ToggleModel };
import { ToggleModel } from '../../domain/prompt/ToggleModel.js';
