/**
 * Boolean confirmation prompt (Yes/No).
 * @param {Object|string} props - Configuration or message.
 */
export function Confirm(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { ConfirmModel };
import { ConfirmModel } from '../../domain/prompt/ConfirmModel.js';
