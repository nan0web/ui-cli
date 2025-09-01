export default class CLIInputAdapter extends InputAdapter {
    /**
     * Requests data using step-by-step input
     * @param {UIForm} form - Form to fill
     * @param {Object} options - Request options
     * @param {boolean} [options.silent=true] - Whether to suppress title output
     * @returns {Promise<UIForm | InputMessage>} UIForm (new form) with the fulfilled state or InputMessage on cancel.
     */
    requestForm(form: UIForm, options?: {
        silent?: boolean | undefined;
    }): Promise<UIForm | InputMessage>;
    /**
     * Request selection from a list
     * @param {Object} config - Selection configuration
     * @param {string} config.title - Selection title
     * @param {string} config.prompt - Selection prompt
     * @param {Array<string> | Map<string, string> | Array<{ label: string, value: string }>} config.options - Selection options
     * @param {string} config.id - Element identifier
     * @returns {Promise<InputMessage>} Input message with result
     */
    requestSelect(config: {
        title: string;
        prompt: string;
        options: Array<string> | Map<string, string> | Array<{
            label: string;
            value: string;
        }>;
        id: string;
    }): Promise<InputMessage>;
    /**
     * Simple string input request
     * @param {Object} config - Input configuration
     * @param {string} config.prompt - Input prompt
     * @param {string} config.id - Element identifier
     * @param {string} config.label
     * @param {string} config.name
     * @returns {Promise<InputMessage>} Input message with result
     */
    requestInput(config: {
        prompt: string;
        id: string;
        label: string;
        name: string;
    }): Promise<InputMessage>;
}
import { InputAdapter } from '@nan0web/ui';
import { UIForm } from '@nan0web/ui';
import { InputMessage } from '@nan0web/ui';
