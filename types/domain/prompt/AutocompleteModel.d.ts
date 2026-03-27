/**
 * Model describing the Autocomplete component parameters.
 */
export class AutocompleteModel {
    static UI: string;
    static help: string;
    static UI_HINT: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_HINT: any;
    options: any;
}
