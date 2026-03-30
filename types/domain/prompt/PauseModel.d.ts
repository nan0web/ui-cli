/**
 * Model describing the Pause component.
 */
export class PauseModel extends Model {
    static ms: {
        default: number;
    };
    static help: string;
    /**
     * @param {Partial<PauseModel> | Record<string, any> | number} [data] Input model data or milliseconds.
     */
    constructor(data?: Partial<PauseModel> | Record<string, any> | number);
    /** @type {number} Duration in milliseconds. */ ms: number;
}
import { Model } from '@nan0web/types';
