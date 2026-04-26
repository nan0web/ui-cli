/**
 * Functional helper for spinner.
 * @param {Partial<Spinner>|string} config
 * @returns {Spinner}
 */
export function spinner(config: Partial<Spinner> | string): Spinner;
/**
 * Visual spinner for async operations.
 *
 * Template Variables Available for `format`:
 * - `{time}`: Elapsed time, e.g., `[00:00]`
 * - `{title}`: The progress title/message
 * - `{frame}`: The current spinner animation frame (e.g. `⠋`)
 *
 * @example
 * const s = new Spinner({ format: '{time} {frame} {title}' })
 */
export class Spinner {
    static FRAMES: string[];
    /** @type {Array<{pattern: RegExp, replacement: string}>} Replacements for snapshots */
    static snapshotReplacements: Array<{
        pattern: RegExp;
        replacement: string;
    }>;
    /**
     * @param {Partial<Spinner> | string} [config] Configuration for the spinner
     */
    constructor(config?: Partial<Spinner> | string);
    /** @type {string} Message to display next to the spinner */
    message: string;
    /** @type {number} Frames per second */
    fps: number;
    /** @type {number} Index of the current frame */
    frameIndex: number;
    /** @type {number} Start time of the spinner */
    startTime: number;
    /** @type {string} Format of the spinner */
    format: string;
    /** @type {string} Status of the spinner */
    status: string;
    /** @type {number} Number of columns for the spinner */
    columns: number;
    /** @type {boolean} Whether to force rendering on a single line */
    forceOneLine: boolean;
    /**
     * Update message.
     * @param {string} message
     * @param {Object} [options]
     */
    update(message: string, options?: any): void;
    /**
     * @param {string} [msg]
     */
    success(msg?: string): void;
    /**
     * @param {string} [msg]
     */
    error(msg?: string): void;
    /**
     * @param {string} [msg]
     */
    stop(msg?: string): void;
    formatTime(seconds: any): string;
    renderToString(): any;
    #private;
}
