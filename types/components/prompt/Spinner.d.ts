/**
 * Spinner Component.
 * Usage: await render(Spinner({ message: 'Loading...', action: promise }))
 *
 * @param {Object} props
 * @param {string} props.message - Main message.
 * @param {Promise<any>} [props.action] - Async action to wait for.
 * @param {string} [props.successMessage] - Message on success.
 * @param {string} [props.errorMessage] - Message on error.
 */
export function Spinner(props: {
    message: string;
    action?: Promise<any> | undefined;
    successMessage?: string | undefined;
    errorMessage?: string | undefined;
}): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
