export class Document extends Model {
    static title: {
        type: string;
        help: string;
    };
    static content: {
        type: string;
        model: typeof Content;
        help: string;
    };
    /**
     *
     * @param {Partial<Document>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<Document>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Title */ title: string;
    /** @type {Array<Content>} Content */ content: Array<Content>;
}
import { Model } from '@nan0web/types';
import { Content } from './Content.js';
