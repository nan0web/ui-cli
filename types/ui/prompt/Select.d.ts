/**
 * Single-choice prompt from a list of options.
 * @param {Object|string} props - Configuration or message.
 */
export function Select(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { SelectModel };
import { SelectModel } from '../../domain/prompt/SelectModel.js';
