/**
 * Functional helper for progress.
 * @param {Object} options
 * @returns {ProgressBar}
 */
export function progress(options: any): ProgressBar;
/**
 * Progress module – visual progress bar with timers.
 * @module ui/progress
 */
/**
 * Renders a progress bar.
 *
 * Template Variables Available for `format`:
 * - `{time}`: Combined elapsed & ETA time, e.g., `[00:00 < 00:00]` or `[00:00]` (indeterminate)
 * - `{title}`: The progress title/message
 * - `{bar}`: The progress bar wrapped in brackets, e.g., `[====>   ]`
 * - `{percent}`: Percentage with `%` sign, e.g., `50%`. Empty if indeterminate.
 * - `{count}`: Formatted current/total, e.g., `50/100` or `150` (indeterminate)
 * - `{elapsed}`: Only elapsed time, e.g., `00:00`
 * - `{eta}`: Only ETA time, e.g., `00:00`
 * - `{current}`: Raw current numeric value
 * - `{total}`: Raw total numeric value
 *
 * @example
 * const p = new ProgressBar({ format: '{time} {title} {bar} {percent} {count}' })
 */
export class ProgressBar {
    /** @type {Array<{pattern: RegExp, replacement: string}>} Replacements for snapshots */
    static snapshotReplacements: Array<{
        pattern: RegExp;
        replacement: string;
    }>;
    /**
     * @param {Object} options
     * @param {number} [options.total] Raw total value
     * @param {string} [options.title] Title of the progress bar
     * @param {number} [options.width=40] Width of the progress bar
     * @param {number} [options.fps=25] Frames per second
     * @param {string} [options.format] Format string of the progress bar
     * @param {number} [options.columns] Number of columns for the progress bar
     * @param {boolean} [options.forceOneLine=false] Force single line output
     */
    constructor(options: {
        total?: number | undefined;
        title?: string | undefined;
        width?: number | undefined;
        fps?: number | undefined;
        format?: string | undefined;
        columns?: number | undefined;
        forceOneLine?: boolean | undefined;
    });
    /** @type {number|undefined} Raw total value */
    total: number | undefined;
    /** @type {string|undefined} Title of the progress bar */
    title: string | undefined;
    /** @type {number} Width of the progress bar */
    width: number;
    /** @type {number} Frames per second */
    fps: number;
    /** @type {number} Current progress */
    current: number;
    /** @type {number} Start time of the progress bar */
    startTime: number;
    /** @type {string} Format string of the progress bar */
    format: string;
    /** @type {number} Number of columns for the progress bar */
    columns: number;
    /** @type {boolean} Whether to force rendering on a single line by dropping elements if needed */
    forceOneLine: boolean;
    /**
     * Update progress.
     * @param {number} current
     * @param {Object} [options]
     */
    update(current: number, options?: any): void;
    success(msg: any): void;
    error(msg: any): void;
    formatTime(seconds: any): string;
    renderToString(): any;
    #private;
}
