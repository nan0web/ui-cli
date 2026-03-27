/**
 * Model describing the Password component parameters.
 */
export class PasswordModel {
    static UI: string;
    static help: string;
    static initial: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    initial: any;
    validate: any;
}
