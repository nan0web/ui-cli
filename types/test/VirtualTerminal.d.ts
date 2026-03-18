/**
 * High-End In-Process Virtual Terminal for fast testing.
 * Mocks process.stdout and process.stdin to interact with CLI components without spawning processes.
 */
export class VirtualTerminal extends EventEmitter<[never]> {
    constructor();
    /** @type {EventEmitter | undefined} */
    stdinBus: EventEmitter | undefined;
    /** @type {Map<string, Function[]> | undefined} */
    _handlers: Map<string, Function[]> | undefined;
    output: any[];
    lines: any[];
    restore(): void;
    /**
     * Simulate keypress
     * @param {string} name - Key name (e.g. 'up', 'down', 'enter')
     * @param {object} [extra] - Extra properties (ctrl, shift, etc.)
     */
    sendKey(name: string, extra?: object): void;
    /**
     * Simulate typing text
     * @param {string} text
     */
    type(text: string): void;
    /**
     * Get clean output lines
     */
    getLines(): string[];
    /**
     * Clear captures
     */
    clear(): void;
    /**
     * Run a CLI component function
     * @template T
     * @param {() => Promise<T>} fn
     * @returns {Promise<T>}
     */
    run<T>(fn: () => Promise<T>): Promise<T>;
    #private;
}
import { EventEmitter } from 'node:events';
