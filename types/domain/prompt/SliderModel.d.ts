/**
 * Model describing the Slider (Number range) component.
 */
export class SliderModel {
    static UI: string;
    static help: string;
    static min: number;
    static max: number;
    static step: number;
    static initial: number;
    /**
     * @param {Object|string} props
     */
    constructor(props?: any | string);
    UI: any;
    min: any;
    max: any;
    step: any;
    initial: any;
}
