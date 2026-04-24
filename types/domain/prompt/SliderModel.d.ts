/**
 * Model describing the Slider (Number range) component.
 */
export class SliderModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static min: {
        default: number;
    };
    static max: {
        default: number;
    };
    static step: {
        default: number;
    };
    static initial: {
        default: number;
    };
    /**
     * @param {Partial<SliderModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SliderModel> | Record<string, any>, options?: object);
    /** @type {string} The message or label. */ UI: string;
    /** @type {number} Minimum. */ min: number;
    /** @type {number} Maximum. */ max: number;
    /** @type {number} Step size. */ step: number;
    /** @type {number} Initial value. */ initial: number;
    /**
     * Map a predefined answer to a numeric result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: number, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: number;
        cancelled: boolean;
    };
}
import { Model } from '@nan0web/types';
