/**
 * Functional helper for spinner.
 * @param {string} message
 * @returns {Spinner}
 */
export function spinner(message: string): Spinner;
/**
 * Spinner module – loading indicators.
 * @module ui/spinner
 */
/**
 * Visual spinner for async operations.
 */
export class Spinner {
    static FRAMES: string[];
    /**
     * @param {string} [message]
     */
    constructor(message?: string);
    message: string;
    frameIndex: number;
    interval: NodeJS.Timeout | null;
    startTime: number;
    start(): void;
    stop(status?: string): void;
}
