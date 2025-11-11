/**
 * Extends the generic {@link BaseInputAdapter} with CLI‑specific behaviour.
 *
 * @class
 * @extends BaseInputAdapter
 */
export default class CLIInputAdapter extends BaseInputAdapter {
    /**
     * Prompt the user for a full form, handling navigation and validation.
     *
     * @param {UIForm} form - Form definition to present.
     * @param {Object} [options={}]
     * @param {boolean} [options.silent=true] - Suppress console output if `true`.
     * @returns {Promise<Object>} Result object containing form data and meta‑information.
     */
    requestForm(form: UIForm, options?: {
        silent?: boolean | undefined;
    } | undefined): Promise<any>;
    /**
     * Prompt the user to select an option from a list.
     *
     * @param {Object} config - Configuration passed to {@link select}.
     * @returns {Promise<any>} Selected value, or empty string on cancellation.
     */
    requestSelect(config: any): Promise<any>;
    /**
     * Prompt for a single string input.
     *
     * @param {Object} config - Prompt configuration.
     * @param {string} [config.prompt] - Prompt text.
     * @param {string} [config.label] - Optional label.
     * @param {string} [config.name] - Optional identifier.
     * @returns {Promise<string>} User response string.
     */
    requestInput(config: {
        prompt?: string | undefined;
        label?: string | undefined;
        name?: string | undefined;
    }): Promise<string>;
    /** @inheritDoc */
    ask(question: any): Promise<string>;
    /** @inheritDoc */
    select(cfg: any): Promise<{
        index: number;
        value: any;
    }>;
}
import { InputAdapter as BaseInputAdapter } from "@nan0web/ui";
import { UIForm } from "@nan0web/ui";
