/**
 * Resolves positional CLI arguments into named model fields.
 *
 * Scans a Model class for `static` field descriptors with `positional: true`.
 * The order of positional fields follows the declaration order of static properties
 * (guaranteed by JavaScript spec for non-integer keys).
 *
 * @example
 * class MyModel {
 *   static source = { help: 'Source path', default: '.', positional: true }
 *   static target = { help: 'Target path', default: 'out', positional: true }
 *   static quiet  = { help: 'Quiet mode', default: false, type: 'boolean' }
 * }
 *
 * const data = resolvePositionalArgs(MyModel, ['src/', 'dist/'])
 * // → { source: 'src/', target: 'dist/' }
 *
 * @param {typeof Model} ModelClass - The Model class with static field descriptors.
 * @param {string[]} args - Positional arguments from the CLI (e.g., process.argv positionals).
 * @param {Object} [existing={}] - Existing named options (take priority over positionals).
 * @returns {Object} Merged data object with positional args resolved to named fields.
 */
export function resolvePositionalArgs(ModelClass: typeof Model, args?: string[], existing?: any): any;
import { Model } from '@nan0web/types';
