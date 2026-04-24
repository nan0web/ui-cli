/**
 * Scrollable markdown content viewer.
 * @param {Object|string} props - Configuration or raw content.
 */
export function ContentViewer(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};
export { ContentViewerModel };
import { ContentViewerModel } from '../../domain/prompt/ContentViewerModel.js';
