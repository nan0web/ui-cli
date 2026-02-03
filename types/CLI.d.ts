/**
 * Main CLi class.
 */
export default class CLi {
    /**
     * Factory to create a CLi instance from various inputs.
     *
     * @param {CLi|Object} input - Existing CLi instance or configuration object.
     * @returns {CLi}
     * @throws {TypeError} If input is neither a CLi nor an object.
     */
    static from(input: CLi | any): CLi;
    /**
     * @param {Object} [input={}]
     * @param {string[]} [input.argv] - Command‑line arguments (defaults to `process.argv.slice(2)`).
     * @param {Object} [input.commands] - Map of command names to handlers.
     * @param {Logger} [input.logger] - Optional logger instance.
     * @param {Array<Function>} [input.Messages] - Message classes for root commands.
     */
    constructor(input?: {
        argv?: string[] | undefined;
        commands?: any;
        logger?: Logger | undefined;
        Messages?: Function[] | undefined;
    } | undefined);
    /** @type {string[]} */
    argv: string[];
    /** @type {Logger} */
    logger: Logger;
    /** @type {Array<Function>} */
    Messages: Array<Function>;
    /** @returns {Map<string,Function>} The command map. */
    get commands(): Map<string, Function>;
    /**
     * Execute the CLi workflow.
     *
     * @param {Message} [msg] - Optional pre‑built message.
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg?: Message | undefined): AsyncGenerator<OutputMessage>;
    #private;
}
import Logger from '@nan0web/log';
import { Message } from '@nan0web/co';
import { OutputMessage } from '@nan0web/co';
