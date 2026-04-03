export function renderMarkdown(content: any): string;
/**
 * Scrollable markdown content viewer with interactive elements (links, forms).
 *
 * @param {Object} config - Viewer configuration.
 * @param {string|Array|Object} config.content - Content to render (Raw Markdown or AST).
 * @param {string} [config.title] - Title string for the viewer header.
 * @param {number} [config.offset] - Initial scroll offset.
 * @param {number} [config.focusedIndex] - Initial focused interactive element index.
 * @param {Function} [config.t] - Translation function.
 * @param {string} [config.UI_SELECT] - Selection label.
 * @param {string} [config.UI_FOCUS] - Focus label.
 * @param {string} [config.UI_SCROLL] - Scroll label.
 * @param {string} [config.UI_BACK] - Back label.

 * @param {Object} [config.console] - Logger instance.
 * @returns {Promise<{value: any, type?: string, action?: string, cancelled: boolean}>}}
 *   - value: selected item (link object, form model, etc.)
 *   - type: 'form_open' if a form was selected
 *   - action: 'back' or 'exit'
 */
export function markdownViewer(config: {
    content: string | any[] | any;
    title?: string | undefined;
    offset?: number | undefined;
    focusedIndex?: number | undefined;
    t?: Function | undefined;
    UI_SELECT?: string | undefined;
    UI_FOCUS?: string | undefined;
    UI_SCROLL?: string | undefined;
    UI_BACK?: string | undefined;
    console?: any;
}): Promise<{
    value: any;
    type?: string;
    action?: string;
    cancelled: boolean;
}>;
