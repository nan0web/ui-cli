/**
 * Model describing the Sortable component parameters.
 */
export class SortableModel {
    static UI: string;
    static help: string;
    static UI_HINT: string;
    static UI_NAV: string;
    static UI_GRAB: string;
    static UI_CONFIRM: string;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_HINT: any;
    items: any;
}
