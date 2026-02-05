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
 */
export class ProgressBar {
    /**
     * @param {Object} options
     * @param {number} options.total
     * @param {string} [options.title]
     * @param {number} [options.width=40]
     */
    constructor(options: {
        total: number;
        title?: string | undefined;
        width?: number | undefined;
    });
    total: number;
    title: string | undefined;
    width: number;
    current: number;
    startTime: number;
    /**
     * Update progress.
     * @param {number} current
     */
    update(current: number): void;
    /**
     * Increment progress.
     * @param {number} [step=1]
     */
    tick(step?: number): void;
    render(): void;
    formatTime(seconds: any): string;
}
