/**
 * @typedef {object} PlaygroundTestConfig
 * @property {NodeJS.ProcessEnv} env Environment variables for the child process.
 * @property {{ includeDebugger?: boolean }} [config={}] Configuration options.
 */
/**
 * Utility class to run playground demos and capture output.
 *
 * Updated behaviour:
 *   – When `PLAY_DEMO_SEQUENCE` is defined, the values are streamed to the
 *     child process **after** each prompt appears.  This guarantees that the
 *     first value is consumed by the first `select` (demo menu) and the
 *     subsequent values are consumed by the following prompts (e.g. colour
 *     selection, UI‑CLI demo, exit).
 *   – A modest delay (≈ 200 ms) between writes gives the child process time to
 *     render the prompt and start listening for input, eliminating race
 *     conditions that caused the previous implementation to feed the next value
 *     too early (resulting in the wrong option being selected).
 */
export default class PlaygroundTest {
    /**
     * @param {NodeJS.ProcessEnv} env Environment variables for the child process.
     * @param {{ includeDebugger?: boolean }} [config={}] Configuration options.
     */
    constructor(env: NodeJS.ProcessEnv, config?: {
        includeDebugger?: boolean | undefined;
    } | undefined);
    env: NodeJS.ProcessEnv;
    /** @type {boolean} Include debugger lines in output (default: false). */
    includeDebugger: boolean;
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
    run(args?: string[] | undefined): Promise<{
        stdout: string;
        stderr: string;
        exitCode: any;
    }>;
    recentResult: {
        stdout: string;
        stderr: string;
        exitCode: any;
    } | undefined;
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
        includeDebugger?: boolean | undefined;
    } | undefined;
};
import { EventContext } from "@nan0web/event";
