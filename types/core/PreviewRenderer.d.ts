/**
 * Handles live preview mock rendering for UI components in CLI.
 */
export default class PreviewRenderer {
    /**
     * @param {import('../InputAdapter.js').default} adapter
     * @param {Object} data - The component model instance.
     * @param {string} componentName - Name of the component.
     */
    static renderPreview(adapter: import("../InputAdapter.js").default, data: any, componentName: string): Promise<void>;
    static "__#private@#mockButtonRender"(adapter: any, data: any, componentName: any): void;
}
