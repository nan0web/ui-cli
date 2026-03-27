/**
 * Model describing the Spinner activity component.
 */
export class SpinnerModel {
    static UI: string;
    static help: string;
    static UI_DONE: string;
    static UI_ERROR: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_DONE: any;
    UI_ERROR: any;
}
