/**
 * Object Map Form Editor — renders an interactive field-by-field
 * editor for Model-as-Schema instances in CLI.
 *
 * Extracted from CLiInputAdapter.renderForm().
 */
export default class ObjectMapEditor {
    /**
     * Build an editor controller for the given data + schema.
     *
     * @param {import('../InputAdapter.js').default} adapter
     * @param {Object} data - Initial document data.
     * @param {Function} SchemaClass - Schema constructor with static fields.
     * @returns {{fill: () => Promise<any>}} Form object with fill method.
     */
    static create(adapter: import("../InputAdapter.js").default, data: any, SchemaClass: Function): {
        fill: () => Promise<any>;
    };
}
