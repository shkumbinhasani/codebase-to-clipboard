#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function readDirectory(dir, basePath = '') {
    let content = '';
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
            content += `\n## Directory: ${relativePath}\n\n`;
            content += await readDirectory(fullPath, relativePath);
        } else {
            content += `\n### File: ${relativePath}\n\n`;
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            content += '```\n' + fileContent + '\n```\n\n';
        }
    }

    return content;
}

async function generateClipboardContent() {
    try {
        const currentDir = process.cwd();
        const content = await readDirectory(currentDir);
        const markdown = `# Codebase Content\n\nThis file contains the content of all files in the directory ${path.basename(currentDir)}.\n\n${content}`;

        // Dynamically import clipboardy (ESM)
        const clipboardy = await import('clipboardy');
        clipboardy.writeSync(markdown);
        
        console.log("Content copied to clipboard successfully.");
    } catch (error) {
        console.error('Error processing the directory:', error);
    }
}

generateClipboardContent();

