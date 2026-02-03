/**
 * Renders an interactive table.
 *
 * @param {Object} input
 * @param {Array<Object>} input.data - Data to display.
 * @param {Array<string>} [input.columns] - Columns to include.
 * @param {string} [input.title] - Table title.
 * @param {boolean} [input.interactive=true] - Whether to allow filtering.
 * @param {boolean} [input.instant=false] - Whether to use instant search (char-by-char).
 * @param {(val:string)=>string} [input.t] - Translation function.
 * @param {Logger} [input.logger] - Logger instance.
 * @param {Function} [input.prompt] - Prompt function.
 * @returns {Promise<{value:any, cancelled:boolean}>} Selected row (if interactive) or last state.
 */
export function table(input: {
    data: Array<any>;
    columns?: string[] | undefined;
    title?: string | undefined;
    interactive?: boolean | undefined;
    instant?: boolean | undefined;
    t?: ((val: string) => string) | undefined;
    logger?: Logger | undefined;
    prompt?: Function | undefined;
}): Promise<{
    value: any;
    cancelled: boolean;
}>;
import Logger from '@nan0web/log';
