/**
 * Interactive list sorting/reordering.
 * @param {Object|string} props - Configuration or message.
 */
export function Sortable(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
export { SortableModel };
import { SortableModel } from '../../domain/prompt/SortableModel.js';
