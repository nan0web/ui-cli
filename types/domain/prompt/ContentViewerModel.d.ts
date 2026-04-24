/**
 * Model describing the ContentViewer component parameters.
 */
export class ContentViewerModel extends Model {
    static UI: {
        title: string;
        focus: string;
        scroll: string;
        back: string;
        select: string;
    };
    static content: {
        alias: string[];
        default: string;
    };
    static title: {
        alias: string[];
        default: string;
    };
    static print: {
        type: string;
        default: boolean;
    };
    static help: string;
    /**
     * @param {Partial<ContentViewerModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ContentViewerModel> | Record<string, any>, options?: object);
    /** @type {string} The content to display. */ content: string;
    /** @type {string} The title of the viewer. */ title: string;
    /** @type {boolean} Print directly. */ print: boolean;
}
import { Model } from '@nan0web/types';
