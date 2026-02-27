/**
 * Interactive sortable list.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question / title.
 * @param {Array<string|{label:string, value:any}>} config.items - Items to sort.
 * @param {string} [config.hint] - Hint text.
 * @param {Function} [config.t] - Translation function.
 * @param {Function} [config.onChange] - Callback on every reorder.
 * @returns {Promise<{value: any[], cancelled: boolean}>}
 */
export function sortable(config: {
    message: string;
    items: Array<string | {
        label: string;
        value: any;
    }>;
    hint?: string;
    t?: Function;
    onChange?: Function;
}): Promise<{
    value: any[];
    cancelled: boolean;
}>;
export default sortable;
