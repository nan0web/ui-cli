/**
 * @class
 * @deprecated use Message or CLiMessage instead
 * @extends Message
 */
export default class CommandMessage extends Message {
    /**
     * Parse raw CLI input into a {@link CommandMessage}.
     *
     * @param {string|string[]} argv - Input string or token array.
     * @param {typeof Object} [BodyClass] - Optional class to instantiate the body.
     * @returns {CommandMessage}
     * @throws {CommandError} If no input is supplied.
     */
    static parse(argv: string | string[], BodyClass?: ObjectConstructor | undefined): CommandMessage;
    /**
     * Convert a raw input into a {@link CommandMessage} instance.
     *
     * @param {CommandMessage|Message|Object|string|Array<string>} input
     * @returns {CommandMessage}
     */
    static from(input: CommandMessage | Message | any | string | Array<string>): CommandMessage;
    /**
     * @param {Object} [input={}]
     * @param {string} [input.name] - Command name.
     * @param {string[]} [input.argv] - Positional arguments.
     * @param {Object} [input.opts] - Options map.
     * @param {Array<CommandMessage>} [input.children] - Nested messages.
     * @param {Object} [input.body] - Message body payload.
     */
    constructor(input?: {
        name?: string | undefined;
        argv?: string[] | undefined;
        opts?: any;
        children?: CommandMessage[] | undefined;
        body?: any;
    } | undefined);
    /** @param {string} v */
    set name(arg: string);
    /** @returns {string} */
    get name(): string;
    /** @param {string[]} v */
    set argv(arg: string[]);
    /** @returns {string[]} */
    get argv(): string[];
    /** @param {Object} v */
    set opts(arg: any);
    /** @returns {Object} */
    get opts(): any;
    /** @returns {Array<CommandMessage>} */
    get children(): CommandMessage[];
    /** @returns {Array<string>} Full command line (name + args). */
    get args(): string[];
    /** @returns {string} Sub‑command name of the first child, or empty string. */
    get subCommand(): string;
    /** @returns {CommandMessage|null} First child message, or null. */
    get subCommandMessage(): CommandMessage | null;
    /**
     * Append a child {@link CommandMessage}.
     *
     * @param {CommandMessage|Object} msg
     */
    add(msg: CommandMessage | any): void;
    #private;
}
import { Message } from "@nan0web/co";
