/**
 * Model describing the Tree navigation component parameters.
 */
export class TreeModel {
    static UI: string;
    static help: string;
    static UI_HINT_SINGLE: string;
    static UI_HINT_MULTI: string;
    static UI_EMPTY: string;
    static UI_LOADING: string;
    static UI_SELECTED: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    multiple: boolean;
    UI_HINT: string;
}
