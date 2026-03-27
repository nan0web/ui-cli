/**
 * Model describing the Confirm component (Yes/No prompt).
 */
export class ConfirmModel {
    static UI: string;
    static help: string;
    static UI_YES: string;
    static UI_NO: string;
    static initial: boolean;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_YES: any;
    UI_NO: any;
    initial: boolean;
}
