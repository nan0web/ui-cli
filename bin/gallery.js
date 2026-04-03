#!/usr/bin/env node
/**
 * nan0gallery — OLMUI Workflow compliant Gallery Generator
 * Scans snapshots and generates recursive Markdown indices.
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dirArg = args.find(a => a.startsWith('--dir='))?.split('=')[1] || 'snapshots/cli';
const rootDir = path.resolve(process.cwd(), dirArg);

if (!fs.existsSync(rootDir)) {
    console.error(`Error: Directory not found: ${rootDir}`);
    process.exit(1);
}

function processDirectory(currentDir, relativePath = '') {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    const subdirs = items.filter(i => i.isDirectory());
    const components = items.filter(i => i.isFile() && i.name.startsWith('comp_') && i.name.endsWith('.md'));

    let indexContent = `# 📸 CLI Gallery: ${relativePath || 'root'}\n\n`;
    
    if (relativePath) {
        indexContent += `[⬅ Назад](../index.md)\n\n`;
    }

    if (subdirs.length > 0) {
        indexContent += `## 📁 Categories / Locales\n\n`;
        for (const dir of subdirs) {
            indexContent += `- [${dir.name}](./${dir.name}/index.md)\n`;
            processDirectory(path.join(currentDir, dir.name), path.join(relativePath, dir.name));
        }
        indexContent += `\n`;
    }

    if (components.length > 0) {
        indexContent += `## 🧱 Components & User Stories\n\n`;
        for (const comp of components) {
            const title = comp.name.replace('comp_', '').replace('.md', '');
            indexContent += `- [${title.charAt(0).toUpperCase() + title.slice(1)}](./${comp.name})\n`;
        }
    }

    fs.writeFileSync(path.join(currentDir, 'index.md'), indexContent);
}

processDirectory(rootDir);
console.log(`✅ OLMUI-compliant Gallery indexes generated at ${rootDir}`);

