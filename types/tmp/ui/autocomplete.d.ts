/**
 * Renders a searchable selection list.
 *
 * @param {Object} input
 * @param {string} [input.message] - Prompt message.
 * @param {string} [input.title] - Alternative prompt title.
 * @param {Array|Function} input.options - List of options or async function to fetch them.
 * @param {number} [input.limit=10] - Max visible items.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>}
 */
export function autocomplete(input: {
    message?: string;
    title?: string;
    options: any[] | Function;
    limit?: number;
}): Promise<{
    index: number;
    value: any;
    cancelled: boolean;
}>;
