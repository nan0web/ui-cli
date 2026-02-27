/**
 * Interactive multiple selection with checkboxes.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {Array<string|Object>} config.options - List of choices
 * @param {number} [config.limit=10] - Visible items limit
 * @param {Array<any>} [config.initial=[]] - Initial selected values
 * @param {string|boolean} [config.instructions] - Custom instructions
 * @param {string} [config.hint] - Navigation hint
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: Array<any>, cancelled: boolean}>}
 */
export function multiselect(config: {
    message: string;
    options: Array<string | any>;
    limit?: number;
    initial?: Array<any>;
    instructions?: string | boolean;
    hint?: string;
    t?: Function;
}): Promise<{
    value: Array<any>;
    cancelled: boolean;
}>;
