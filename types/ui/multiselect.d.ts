/**
 * Interactive multiple selection with checkboxes.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {Array<string|Object>} config.options - List of choices
 * @param {number} [config.limit=10] - Visible items limit
 * @param {Array<any>} [config.initial=[]] - Initial selected values
 * @param {string|boolean} [config.instructions] - Custom instructions
 * @returns {Promise<{value: Array<any>, cancelled: boolean}>}
 */
export function multiselect(config: {
    message: string;
    options: Array<string | any>;
    limit?: number | undefined;
    initial?: any[] | undefined;
    instructions?: string | boolean | undefined;
}): Promise<{
    value: Array<any>;
    cancelled: boolean;
}>;
