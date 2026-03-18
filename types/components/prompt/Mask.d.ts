/**
 * @param {Object} props
 * @param {string} props.message
 * @param {string} props.mask
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 */
export function Mask(props: {
    message: string;
    mask: string;
    label?: string | undefined;
    placeholder?: string | undefined;
}): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
