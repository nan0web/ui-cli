/**
 * Model describing the Multiselect component (Checkboxes).
 */
export class MultiselectModel {
    static UI: string;
    static help: string;
    static UI_HINT: string;
    static UI_HELP: string;
    static UI_INSTRUCTIONS: string;
    static UI_HIGHLIGHT: string;
    static UI_TOGGLE: string;
    static UI_TOGGLE_ALL: string;
    static UI_COMPLETE: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_HINT: any;
    options: any;
}
