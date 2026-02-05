/**
 * Configuration object for {@link select}.
 *
 * @param {Object} input
 * @param {string} input.title - Title displayed above the options list.
 * @param {string} [input.prompt] - Prompt displayed for the answer.
 * @param {Array|Map} input.options - Collection of selectable items.
 * @param {Object} [input.console] - Deprecated. Ignored in new implementation.
 * @param {string[]} [input.stops=[]] - Deprecated. Ignored in new implementation.
 * @param {any} [input.ask] - Deprecated. Ignored in new implementation.
 * @param {string} [input.invalidPrompt] - Deprecated. Ignored in new implementation.
 * @param {number} [input.limit=10] - Max visible items.
 * @param {string} [input.hint] - Hint text.
 * @param {Function} [input.t] - Translation function.
 * @returns {Promise<{index:number,value:any,cancelled:boolean}>} Resolves with the selected index and its value.
 *
 * @throws {CancelError} When the user cancels the operation.
 */
export function select(input: {
    title: string;
    prompt?: string | undefined;
    options: any[] | Map<any, any>;
    console?: any;
    stops?: string[] | undefined;
    ask?: any;
    invalidPrompt?: string | undefined;
    limit?: number | undefined;
    hint?: string | undefined;
    t?: Function | undefined;
}): Promise<{
    index: number;
    value: any;
    cancelled: boolean;
}>;
export default select;
