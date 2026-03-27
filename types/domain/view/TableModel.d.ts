/**
 * Model describing the Table component parameters.
 */
export class TableModel {
    static UI: string;
    static help: string;
    static UI_FILTER: string;
    static UI_NONE: string;
    static UI_FILTER_PROMPT: string;
    /**
     * @param {Object} props
     */
    constructor(props?: any);
    UI: any;
    data: any;
    columns: any;
    interactive: boolean;
}
