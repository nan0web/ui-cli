/**
 * Renders an interactive table.
 *
 * @param {Object} input
 * @param {Array<Object>} input.data - Data to display.
 * @param {Array<string>} [input.columns] - Columns to include.
 * @param {string} [input.title] - Table title.
 * @param {boolean} [input.interactive=true] - Whether to allow filtering.
 * @param {boolean} [input.instant=false] - Whether to use instant search (char-by-char).
 * @returns {Promise<{value:any, cancelled:boolean}>} Selected row (if interactive) or last state.
 */
export function table(input: {
    data: Array<any>;
    columns?: string[] | undefined;
    title?: string | undefined;
    interactive?: boolean | undefined;
    instant?: boolean | undefined;
}): Promise<{
    value: any;
    cancelled: boolean;
}>;
export default table;
