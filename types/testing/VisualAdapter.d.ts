/**
 * VisualAdapter (CLI)
 *
 * Рендерить "Логічні зліпки" у візуальні CLI-подібні блоки Markdown (Snapshot format).
 */
export class VisualAdapter {
    /** @type {Map<string, Function>} */
    static "__#private@#renderers": Map<string, Function>;
    /**
     * @param {string} component
     * @param {Function} renderer
     */
    static registerRenderer(component: string, renderer: Function): void;
    /**
     * Конвертує одну інтенцію у візуальний блок Markdown.
     * @param {object} intent - Intent entry from LogicInspector
     * @param {function} t - i18n translate function
     * @param {object} [options] - Rendering options
     * @returns {string} Markdown ANSI-style text block
     */
    static render(intent: object, t?: Function, options?: object): string;
}
