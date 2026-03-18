/**
 * File and Directory Picker
 *
 * @param {Object} config
 * @param {string} [config.message='Select file:']
 * @param {string} [config.root='.'] Starting directory
 * @param {string} [config.mode='file'] 'file', 'dir', or 'any'
 * @param {boolean} [config.showHidden=false]
 * @param {boolean} [config.cache=true] Enable mtime-based optimization
 * @param {number} [config.maxDepth=5]
 * @param {string[]} [config.extensions=[]] Filter by extensions (e.g. ['.js', '.yaml'])
 * @param {Function} [config.t] Translator function
 */
export function filePicker(config?: {
    message?: string | undefined;
    root?: string | undefined;
    mode?: string | undefined;
    showHidden?: boolean | undefined;
    cache?: boolean | undefined;
    maxDepth?: number | undefined;
    extensions?: string[] | undefined;
    t?: Function | undefined;
}): Promise<any>;
