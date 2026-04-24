/**
 * Formatted mask input (e.g., phone, credit card).
 * @param {Object|string} props - Configuration or message.
 */
export function Mask(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};
export { MaskModel };
import { MaskModel } from '../../domain/prompt/MaskModel.js';
