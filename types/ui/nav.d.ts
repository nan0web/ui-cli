/**
 * Renders a breadcrumb trail.
 *
 * @param {string[]} items - List of path segments.
 * @param {Object} [options]
 * @param {string} [options.separator='›'] - Separator character.
 * @returns {string} Styled string.
 */
export function breadcrumbs(items: string[], options?: {
    separator?: string | undefined;
}): string;
/**
 * Renders a tab bar (visual only).
 *
 * @param {string[]} items - List of tab labels.
 * @param {number} [active=0] - Index of active tab.
 * @returns {string} Styled string.
 */
export function tabs(items: string[], active?: number): string;
/**
 * Renders a step indicator (wizard).
 *
 * @param {string[]} items - List of step labels.
 * @param {number} [current=0] - Index of current step.
 * @returns {string} Styled string.
 */
export function steps(items: string[], current?: number): string;
