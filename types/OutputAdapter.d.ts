/**
 * OutputAdapter handles UI output operations in command-line environment.
 * @class
 */
export default class OutputAdapter {
    /**
     * Creates new output adapter.
     * @param {Object} [options] - Configuration options.
     * @param {any} [options.console] - Console implementation.
     * @param {Map<string, () => Promise<Function>>} [options.components] - Component loaders.
     */
    constructor(options?: {
        console?: any;
        components?: Map<string, () => Promise<Function>> | undefined;
    } | undefined);
    /** @returns {any} */
    get console(): any;
    /**
     * Render a UI component in the CLI environment.
     *
     * The current implementation supports simple textual rendering.
     *
     * @param {string} component - Component name (e.g. `"Alert"`).
     * @param {object} props - Props object passed to the component.
     * @returns {Promise<void>}
     */
    render(component: string, props: object): Promise<void>;
    #private;
}
