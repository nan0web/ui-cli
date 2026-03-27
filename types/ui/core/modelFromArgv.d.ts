/**
 * Creates a Model instance from CLI argv by auto-generating parseArgs config
 * from the Model's static field descriptors.
 *
 * Combines three steps into one:
 * 1. Scans static fields → generates `parseArgs` options (type, short alias)
 * 2. Calls `parseArgs` from `node:util` → splits into positionals + named values
 * 3. Calls `resolvePositionalArgs` → merges positionals into named by `positional: true`
 * 4. Returns `new Model(mergedData)`
 *
 * @example
 * const model = modelFromArgv(TranslateDocsModel, process.argv.slice(2))
 * // Equivalent to:
 * //   parseArgs → resolvePositionalArgs → new TranslateDocsModel(data)
 *
 * @template {new (data?: any) => any} T
 * @param {T} ModelClass - Model class with static field descriptors.
 * @param {string[]} argv - Raw CLI arguments (typically process.argv.slice(2)).
 * @returns {InstanceType<T>} A fully resolved Model instance.
 */
export function modelFromArgv<T extends new (data?: any) => any>(ModelClass: T, argv?: string[]): InstanceType<T>;
