/**
 * Нормалізує CLI вивід для snapshot порівняння.
 *
 * @param {string} str — сирий stdout/stderr
 * @param {Array<{pattern: RegExp, replacement?: string}>} [replacements=[]]
 * @returns {string}
 */
export function normalize(str: string, replacements?: Array<{
    pattern: RegExp;
    replacement?: string;
}>): string;
/**
 * Збирає snapshotReplacements з усіх переданих компонентів.
 * Компоненти без `snapshotReplacements` ігноруються.
 *
 * @param {...any} components
 * @returns {Array<{pattern: RegExp, replacement?: string}>}
 */
export function collectReplacements(...components: any[]): Array<{
    pattern: RegExp;
    replacement?: string;
}>;
/** Tree icon replacements — frequently duplicated across projects */
export const TREE_REPLACEMENTS: {
    pattern: RegExp;
    replacement: string;
}[];
