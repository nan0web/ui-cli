/**
 * Model describing the ProgressBar component parameters.
 */
export class ProgressBarModel {
    static UI: string;
    static help: string;
    static UI_ERROR: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_ERROR: any;
    initial: any;
    total: any;
}
