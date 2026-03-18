/**
 * Alert View Component.
 *
 * @param {Object} props
 * @param {string} props.title - Title of the alert.
 * @param {string} props.children - Message content.
 * @param {'info'|'success'|'warning'|'error'} [props.variant='info'] - Style variant.
 * @param {string} [props.message] - Alias for children (legacy support).
 * @param {boolean} [props.sound] - Play sound (side-effect during toString is acceptable here as it invokes on print).
 */
export function Alert(props: {
    title: string;
    children: string;
    variant?: "error" | "info" | "success" | "warning" | undefined;
    message?: string | undefined;
    sound?: boolean | undefined;
}): {
    $$typeof: symbol;
    type: string;
    props: any;
};
