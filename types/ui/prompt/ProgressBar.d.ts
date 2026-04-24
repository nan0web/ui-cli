/**
 * Visual task progress bar.
 * @param {Object|string} props - Configuration or message.
 */
export function ProgressBar(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};
export { ProgressBarModel };
import { ProgressBarModel } from '../../domain/prompt/ProgressBarModel.js';
