/**
 * Sortable Prompt Component.
 *
 * Interactive reorderable list — user can navigate and drag items
 * up/down to set the desired order.
 *
 * Uses SortableList from @nan0web/ui as headless data model.
 *
 * @param {Object} props
 * @param {string} props.message - Question / title.
 * @param {Array<string|{label:string, value:any}>} props.items - Items to sort.
 * @param {string} [props.hint] - Hint text.
 * @param {Function} [props.onChange] - Callback on every reorder.
 */
export function Sortable(props: {
    message: string;
    items: Array<string | {
        label: string;
        value: any;
    }>;
    hint?: string | undefined;
    onChange?: Function | undefined;
}): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
