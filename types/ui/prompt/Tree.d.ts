/**
 * Tree navigation/selection prompt.
 * @param {Object|string} props - Configuration or message.
 */
export function Tree(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};
export { TreeModel };
import { TreeModel } from '../../domain/prompt/TreeModel.js';
