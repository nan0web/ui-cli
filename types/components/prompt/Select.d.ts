/**
 * Select Prompt Component.
 *
 * @param {Object} props
 * @param {string} props.message - Question/Title.
 * @param {Array} props.options - Options list.
 * @param {number} [props.limit] - Max visible options.
 */
export function Select(props: {
    message: string;
    options: any[];
    limit?: number | undefined;
}): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
