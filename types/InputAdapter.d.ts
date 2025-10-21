/**
 * CLI specific adapter extending the generic {@link BaseInputAdapter}.
 * Implements concrete `ask` and `select` helpers that rely on the CLI utilities.
 */
export default class CLIInputAdapter extends BaseInputAdapter {
    /**
     * Interactively fill a {@link UIForm} field‑by‑field.
     *
     * @param {UIForm} form – Form definition to be filled.
     * @param {Object} options – Request options.
     * @param {boolean} [options.silent=true] Suppress title output when `true`.
     * @returns {Promise<FormMessage>} Message with `escaped` = true on cancel,
     *                                 otherwise `escaped` = false and the completed form attached as `form`.
     */
    requestForm(form: UIForm, options?: {
        silent?: boolean | undefined;
    }): Promise<FormMessage>;
    /**
     * Request a selection from a list of options.
     *
     * @param {Object} config – Selection configuration.
     * @param {string} config.title – Title displayed before the list.
     * @param {string} config.prompt – Prompt text.
     * @param {Array<string>|Map<string,string>|Array<{label:string,value:string}>} config.options – Options to choose from.
     * @param {string} config.id – Identifier for the resulting message.
     * @returns {Promise<BaseInputMessage>} Message containing chosen value and metadata.
     */
    requestSelect(config: {
        title: string;
        prompt: string;
        options: Array<string> | Map<string, string> | Array<{
            label: string;
            value: string;
        }>;
        id: string;
    }): Promise<BaseInputMessage>;
    /**
     * Simple string input request.
     *
     * @param {Object} config Input configuration.
     * @param {string} config.prompt Prompt text.
     * @param {string} config.id Identifier for the resulting message.
     * @param {string} [config.label] Optional label used as fallback.
     * @param {string} [config.name] Optional name used as fallback.
     * @returns {Promise<BaseInputMessage>} Message containing the entered text.
     */
    requestInput(config: {
        prompt: string;
        id: string;
        label?: string | undefined;
        name?: string | undefined;
    }): Promise<BaseInputMessage>;
    /** @inheritDoc */
    ask(question: any): Promise<any>;
    /** @inheritDoc */
    select(config: any): Promise<{
        index: number; /** @type {UIForm} Form data associated with the message */
        value: string | null;
    }>;
}
export type FormMessageValue = Partial<UIForm>;
export type InputMessageValue = Partial<Message> | null;
import { InputAdapter as BaseInputAdapter } from '@nan0web/ui';
import { UIForm } from '@nan0web/ui';
/** @typedef {Partial<UIForm>} FormMessageValue */
/** @typedef {Partial<Message> | null} InputMessageValue */
/**
 * Extends the generic {@link BaseInputMessage} to carry a {@link UIForm}
 * instance alongside the usual input message payload.
 *
 * The original {@link BaseInputMessage} expects a `value` of type
 * {@link InputMessageValue} (a {@link Message} payload).  To remain
 * compatible we keep `value` unchanged and store the form data in a
 * separate `form` property.
 */
declare class FormMessage extends BaseInputMessage {
    /**
     * Creates a {@link FormMessage} from an existing instance or plain data.
     *
     * @param {FormMessage|object} input – Existing message or raw data.
     * @returns {FormMessage}
     */
    static from(input: FormMessage | object): FormMessage;
    /**
     * Creates a new {@link FormMessage}.
     *
     * @param {object} props - Message properties.
     * @param {FormMessageValue} [props.form={}] UIForm instance or data.
     * @param {InputMessageValue} [props.value=null] Retained for compatibility.
     * @param {string[]|string} [props.options=[]] Available options.
     * @param {boolean} [props.waiting=false] Waiting flag.
     * @param {boolean} [props.escaped=false] Escape flag.
     */
    constructor(props?: {
        form?: Partial<UIForm> | undefined;
        value?: InputMessageValue | undefined;
        options?: string | string[] | undefined;
        waiting?: boolean | undefined;
        escaped?: boolean | undefined;
    });
    /** @type {UIForm} Form data associated with the message */
    form: UIForm;
}
import { InputMessage as BaseInputMessage } from '@nan0web/ui';
import { Message } from '@nan0web/co';
export {};
