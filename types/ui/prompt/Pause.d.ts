/**
 * Halts execution passively for a specified duration.
 *
 * @param {PauseModel|Object|number} props - Configuration or milliseconds.
 */
export function Pause(props: PauseModel | any | number): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { PauseModel };
import { PauseModel } from '../../domain/prompt/PauseModel.js';
