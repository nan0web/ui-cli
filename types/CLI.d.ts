/**
 * Main CLI class.
 */
export default class CLI {
    /**
     * Factory to create a CLI instance from various inputs.
     *
     * @param {CLI|Object} input - Existing CLI instance or configuration object.
     * @returns {CLI}
     * @throws {TypeError} If input is neither a CLI nor an object.
     */
    static from(input: CLI | any): CLI;
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
    });
    /** @type {string[]} */
    argv: string[];
    /** @type {Logger} */
    logger: Logger;
    /** @type {Array<Function>} */
    Messages: Array<Function>;
    /** @returns {Map<string,Function>} The command map. */
    get commands(): Map<string, Function>;
    /**
     * Execute the CLI workflow.
     *
     * @param {Message} [msg] - Optional pre‑built message.
     * @yields {OutputMessage|InputMessage}
     */
    run(msg?: Message): AsyncGenerator<any, void, unknown>;
    #private;
}
import Logger from "@nan0web/log";
import { Message } from "@nan0web/co";
