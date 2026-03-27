/**
 * Model describing the Input component parameters.
 */
export class InputModel {
    static UI: string;
    static help: string;
    static initial: string;
    static type: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    initial: any;
    type: any;
    validate: any;
    format: any;
}
