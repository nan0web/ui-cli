/**
 * @typedef {object} PlaygroundTestConfig
 * @property {NodeJS.ProcessEnv} env Environment variables for the child process.
 * @property {{ includeDebugger?: boolean, includeEmptyLines?: boolean, feedStdin?: boolean }} [config={}] Configuration options.
 */
/**
 * Utility class to run playground demos and capture output.
 *
 * Updated behaviour:
 *   – When `PLAY_DEMO_SEQUENCE` is defined, the values are streamed to the
 *     child process **asynchronously** with a short delay between writes.
 *   – Errors caused by writing to a closed stdin (EPIPE) are ignored, allowing
 *     the child process to exit cleanly when a demo cancels early.
 *   – After execution, leading whitespace on each output line is stripped so
 *     that the test suite can compare raw lines without dealing with logger
 *       formatting (e.g. logger prefixes, indentation).
 */
export default class PlaygroundTest {
    /**
     * @param {NodeJS.ProcessEnv} env Environment variables for the child process.
     * @param {{ includeDebugger?: boolean, includeEmptyLines?: boolean, feedStdin?: boolean }} [config={}] Configuration options.
     */
    constructor(env: NodeJS.ProcessEnv, config?: {
        includeDebugger?: boolean;
        includeEmptyLines?: boolean;
        feedStdin?: boolean;
    });
    env: NodeJS.ProcessEnv;
    /** @type {boolean} Include debugger lines in output (default: false). */
    includeDebugger: boolean;
    incldeEmptyLines: boolean;
    feedStdin: boolean;
    /** @type {import('node:child_process').ChildProcess | null} */
    child: import("node:child_process").ChildProcess | null;
    /** @type {any} */
    recentResult: any;
    /**
     * Subscribe to an event.
     */
    on(event: any, fn: any): void;
    /**
     * Unsubscribe from an event.
     */
    off(event: any, fn: any): void;
    /**
     * Emit an event.
     */
    emit(event: any, data: any): Promise<EventContext<any>>;
    /**
     * Filter debugger related lines.
     */
    filterDebugger(str: any): any;
    /**
     * Slice lines from stdout or stderr.
     */
    slice(target: any, start: any, end: any): any;
    /**
     * Executes the playground script.
     *
     * @param {string[]} [args=["play/main.js"]] Arguments passed to the node process.
     */
    run(args?: string[]): Promise<any>;
    /**
     * Feed data to the child's stdin.
     * @param {string} data
     */
    feed(data: string): Promise<void>;
    /**
     * Stop the child process.
     */
    stop(): Promise<void>;
    #private;
}
export type PlaygroundTestConfig = {
    /**
     * Environment variables for the child process.
     */
    env: NodeJS.ProcessEnv;
    /**
     * Configuration options.
     */
    config?: {
        includeDebugger?: boolean;
        includeEmptyLines?: boolean;
        feedStdin?: boolean;
    } | undefined;
};
import { EventContext } from '@nan0web/event';
