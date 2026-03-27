/**
 * Basic password (masked) input prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Password(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { PasswordModel };
import { PasswordModel } from '../../domain/prompt/PasswordModel.js';
