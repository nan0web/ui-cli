/**
 * @typedef {Object} CommandHelpField
 * @property {string} [help]        - Human readable description.
 * @property {string} [placeholder] - Placeholder for usage (e.g. "<user>").
 * @property {string} [alias]       - Short alias (single‑letter).
 */
/**
 * CommandHelp – generates CLI help from a Message body schema.
 * Supports nesting via static `Children`; message‑centric.
 *
 * @example
 * const help = new CommandHelp(AuthMessage)
 * console.log(help.generate())        // → formatted help string
 * help.print()                       // → logs to console
 */
export default class CommandHelp {
    /**
     * @param {typeof Message} MessageClass - Message class with a schema.
     * @param {Logger} [logger=new Logger()] - Optional logger.
     */
    constructor(MessageClass: typeof Message, logger?: Logger | undefined);
    /** @type {typeof Message} Message class the help is built for */
    MessageClass: typeof Message;
    /** @type {Logger} Logger used for printing */
    logger: Logger;
    /** @type {typeof Message.Body} Body class reference */
    BodyClass: typeof Message.Body;
    /** @returns {typeof Logger} */
    get Logger(): typeof Logger;
    /**
     * Generates the full help text.
     *
     * @returns {string} Formatted help text.
     */
    generate(): string;
    /**
     * Prints the generated help to the logger.
     */
    print(): void;
    #private;
}
export type CommandHelpField = {
    /**
     * - Human readable description.
     */
    help?: string | undefined;
    /**
     * - Placeholder for usage (e.g. "<user>").
     */
    placeholder?: string | undefined;
    /**
     * - Short alias (single‑letter).
     */
    alias?: string | undefined;
};
import { Message } from "@nan0web/co";
import Logger from "@nan0web/log";
