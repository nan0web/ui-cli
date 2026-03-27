/**
 * Model describing the Select component (Radio-button list).
 */
export class SelectModel {
    static UI: string;
    static help: string;
    static UI_HINT: string;
    static UI_MORE: string;
    static UI_RESULT: string;
    static UI_PROMPT: string;
    static initial: number;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    UI_HINT: any;
    initial: any;
    options: any;
}
