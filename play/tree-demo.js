/**
 * Tree View Demo.
 *
 * @module play/tree-demo
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Run the tree view demo.
 *
 * @param {import('@nan0web/log').default} console - Logger instance.
 * @param {import('../src/InputAdapter').default} adapter - CLI Input Adapter.
 * @param {Function} t - Translation function.
 */
export async function runTreeDemo(console, adapter, t) {
    console.clear()
    console.success(t('Tree View Demo'))

    // Load real data
    const dataPath = path.join(process.cwd(), 'play', 'data', 'tree.json')
    if (!fs.existsSync(dataPath)) {
        console.warn(t('Scan data found not found. Please run: node play/scripts/scan-fs.js'))
        return
    }
    const realTree = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    // Pre-process realTree to assign paths and index
    const pathMap = new Map()

    // Helper to calculate paths and index
    const augmentTree = (node, parentPath) => {
        let fullPath;
        if (!parentPath) {
            // Root node handling: try to anchor to CWD if names match
            if (node.name === path.basename(process.cwd())) {
                fullPath = process.cwd()
            } else {
                fullPath = path.join(process.cwd(), node.name)
            }
        } else {
            fullPath = path.join(parentPath, node.name)
        }

        node.path = fullPath
        pathMap.set(node.path, node)

        if (node.children) {
            node.children.forEach(c => augmentTree(c, fullPath))
        }
    }

    // Handle array or single root
    if (Array.isArray(realTree)) {
        realTree.forEach(node => augmentTree(node, null))
    } else {
        augmentTree(realTree, null)
    }

    // Demo 1: File Selection (Static Tree)
    // We use the real tree fully loaded.
    console.info('\n' + t('Scenario 1: Select a File (Static Tree)'))
    const fileNode = await adapter.requestTree({
        message: t('Select a file:'),
        tree: realTree,
        mode: 'file'
    })
    console.info(`${t('You selected:')} ${fileNode?.name}`)
    if (fileNode?.path) {
        console.info(`${t('Full path:')} ${fileNode.path}`)
    }

    // Demo 2: Async Directory Selection
    console.info('\n' + t('Scenario 2: Select a Directory (Async/Lazy)'))

    // Create lazy root (copy of real root but without children, preserving path)
    const lazyRoot = Array.isArray(realTree)
        ? realTree.map(r => ({ ...r, children: undefined }))
        : { ...realTree, children: undefined }

    const asyncLoader = async (node) => {
        await new Promise(r => setTimeout(r, 400)) // Fake latency

        if (!node) {
            // Initial load
            return Array.isArray(lazyRoot) ? lazyRoot : [lazyRoot]
        }

        // Fast lookup by Path (O(1))
        const realNode = pathMap.get(node.path)
        if (!realNode || !realNode.children) return []

        // Return children without their sub-children (lazy)
        return realNode.children.map(c => ({ ...c, children: undefined }))
    }

    // For prompt, we pass loader instead of tree
    const dirNode = await adapter.requestTree({
        message: t('Select a directory:'),
        loader: asyncLoader,
        mode: 'dir'
    })
    console.info(`${t('You selected:')} ${dirNode?.name}`)
    if (dirNode?.path) {
        console.info(`${t('Full path:')} ${dirNode.path}`)
    }

    // Demo 3: Multi-Select
    console.info('\n' + t('Scenario 3: Multi-Select Files'))
    const selected = await adapter.requestTree({
        message: t('Select files to delete:'),
        tree: realTree, // Use full tree for speed
        mode: 'multi'
    })
    console.info(`${t('Selected')} ${selected?.length} ${t('items')}: ${selected?.map(n => n.name).join(', ')}`)

    await adapter.pause(t('Press any key to continue...'))
}
