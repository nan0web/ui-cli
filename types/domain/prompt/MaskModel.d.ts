/**
 * Model describing the Mask component parameters.
 */
export class MaskModel {
    static UI: string;
    static help: string;
    static UI_FORMAT_MSG: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    mask: any;
}
