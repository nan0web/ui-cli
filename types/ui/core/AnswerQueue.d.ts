/**
 * Manages the predefined answer queue for automated UI-CLI interactions.
 * Helps isolated tests and playground demos function correctly.
 */
export default class AnswerQueue {
    constructor(options?: {});
    _answers: any[];
    _cursor: number;
    /** @type {boolean} Temporarily disable automated answers */
    _disableNextAnswerLookup: boolean;
    /**
     * Consume and return the next predefined answer, if any.
     * Returns null if the queue is empty or disabled.
     * @returns {string|null}
     */
    next(): string | null;
    /**
     * Get the array of remaining answers without consuming them.
     * @returns {string[]}
     */
    getRemaining(): string[];
    /**
     * @param {boolean} disable
     */
    setDisabled(disable: boolean): void;
}
