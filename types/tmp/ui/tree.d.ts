/**
 * @typedef {Object} TreeNode
 * @property {string} name
 * @property {'file'|'dir'} type
 * @property {TreeNode[]} [children] -- If undefined, might be loaded async
 * @property {any} [payload] -- Custom data
 * @property {any} [value] -- Result value (usually same as path or name)
 * @property {string} [path] -- File path
 * @property {boolean} [expanded] -- Internal state
 * @property {boolean} [checked] -- Internal state
 * @property {number} [depth] -- Calculated
 */
/**
 * Tree Prompt
 */
export function tree(config: any): Promise<any>;
export type TreeNode = {
    name: string;
    type: "file" | "dir";
    /**
     * -- If undefined, might be loaded async
     */
    children?: TreeNode[];
    /**
     * -- Custom data
     */
    payload?: any;
    /**
     * -- Result value (usually same as path or name)
     */
    value?: any;
    /**
     * -- File path
     */
    path?: string;
    /**
     * -- Internal state
     */
    expanded?: boolean;
    /**
     * -- Internal state
     */
    checked?: boolean;
    /**
     * -- Calculated
     */
    depth?: number;
};
