/**
 * Model describing the ContentViewer component parameters.
 */
export class ContentViewerModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static UI_TITLE: {
        alias: string[];
        default: string;
    };
    static help: string;
    /**
     * @param {Partial<ContentViewerModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ContentViewerModel> | Record<string, any>, options?: object);
    /** @type {string} The content to display. */ UI: string;
    /** @type {string} The title of the viewer. */ UI_TITLE: string;
}
import { Model } from '@nan0web/types';
