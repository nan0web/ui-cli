/**
 * @typedef {Object} TreeNode
 * @property {string} name
 * @property {'file'|'dir'} type
 * @property {TreeNode[]} [children] -- If undefined, might be loaded async
 * @property {any} [payload] -- Custom data
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
    children?: TreeNode[] | undefined;
    /**
     * -- Custom data
     */
    payload?: any;
    /**
     * -- Internal state
     */
    expanded?: boolean | undefined;
    /**
     * -- Internal state
     */
    checked?: boolean | undefined;
    /**
     * -- Calculated
     */
    depth?: number | undefined;
};
