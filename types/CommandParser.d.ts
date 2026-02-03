/**
 * @class
 */
export default class CommandParser {
    /**
     * @param {Array<Function>} [Messages=[]] - Root message classes.
     */
    constructor(Messages?: Array<Function>);
    /** @type {Array<Function>} */
    Messages: Array<Function>;
    /**
     * Parse the provided input into a message hierarchy.
     *
     * @param {string|string[]} [input=process.argv.slice(2)] - CLI arguments.
     * @returns {Message}
     * @throws {Error} If no command is supplied or unknown root command.
     */
    parse(input?: string | string[]): Message;
    /**
     * Generate help text for a given message class.
     *
     * @param {typeof Message} MessageClass
     * @returns {string}
     */
    generateHelp(MessageClass: typeof Message): string;
    #private;
}
import { Message } from '@nan0web/co';
