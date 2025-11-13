/**
 * Represents a command definition.
 *
 * @class
 * @deprecated Use CLI instead
 */
export default class Command {
    /**
     * @param {Object} config - Command configuration.
     * @param {string} [config.name] - Command name.
     * @param {string} [config.help] - Help description.
     * @param {Object} [config.options] - Options map (`{ flag: [type, default, help] }`).
     * @param {Function} [config.run] - Async generator handling execution.
     * @param {Command[]} [config.children] - Sub‑commands.
     */
    constructor(config: {
        name?: string | undefined;
        help?: string | undefined;
        options?: any;
        run?: Function | undefined;
        children?: Command[] | undefined;
    });
    /** @type {string} */ name: string;
    /** @type {string} */ help: string;
    /** @type {Object} */ options: any;
    /** @type {Function} */ run: Function;
    /** @type {Command[]} */ children: Command[];
    /**
     * Add a sub‑command.
     *
     * @param {Command} command - Sub‑command instance.
     * @returns {this}
     */
    addSubcommand(command: Command): this;
    /**
     * Find a sub‑command by name.
     *
     * @param {string} name - Sub‑command name.
     * @returns {Command|null}
     */
    findSubcommand(name: string): Command | null;
    /**
     * Parse argv into a {@link CommandMessage}.
     *
     * @param {string[]|string} argv - Arguments array or string.
     * @returns {CommandMessage}
     */
    parse(argv: string[] | string): CommandMessage;
    /**
     * Generate a short help string.
     *
     * @returns {string}
     */
    generateHelp(): string;
    /**
     * Execute the command's run generator.
     *
     * @param {Message} message - Message passed to the runner.
     * @yields {any}
     * @throws {CommandError}
     */
    execute(message: Message): AsyncGenerator<any, void, any>;
    /**
     * Apply default values from the options definition to the parsed message.
     *
     * @param {CommandMessage} msg
     * @private
     */
    private _applyDefaults;
}
import CommandMessage from "./CommandMessage.js";
import { Message } from "@nan0web/co";
