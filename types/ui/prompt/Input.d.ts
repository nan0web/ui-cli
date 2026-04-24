/**
 * Basic text input prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Input(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};
export { InputModel };
import { InputModel } from '../../domain/prompt/InputModel.js';
