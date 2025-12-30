
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = process.cwd();
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.vscode', 'backstop_data', 'brain', 'tools'];
const EXCLUDE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.icon', '.txt', '.md', '.json', '.html', '.css', '.map'];

let allFiles = [];
let importGraph = new Map(); // file -> [importedFiles]
let usageCounts = new Map(); // file -> count

function normalizePath(filePath) {
    return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

function scanForFiles(directory) {
    const items = fs.readdirSync(directory);
    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(item)) {
                scanForFiles(fullPath);
            }
        } else {
            const ext = path.extname(item).toLowerCase();
            if (ext === '.js' || ext === '.html') {
                allFiles.push(fullPath);
                usageCounts.set(fullPath, 0);
            }
        }
    }
}

function parseImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dir = path.dirname(filePath);
    const imports = [];

    // JS Imports
    if (filePath.endsWith('.js')) {
        const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
    }

    // HTML Scripts
    if (filePath.endsWith('.html')) {
        const scriptRegex = /<script\s+[^>]*src=['"]([^'"]+)['"]/g;
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        // Module imports in script tags
        const moduleRegex = /import\s+['"]([^'"]+)['"]/g;
        while ((match = moduleRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
    }

    // Resolve Paths
    imports.forEach(importPath => {
        // Skip node_modules or absolute URLs not in our project
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) return;

        try {
            let absolutePath;
            if (importPath.startsWith('/')) {
                // Assume / starts from ROOT_DIR for simplicity in this context (or public)
                // But in Vite/Web projects, / usually maps to public or root.
                absolutePath = path.join(ROOT_DIR, importPath);
            } else {
                absolutePath = path.resolve(dir, importPath);
            }

            // Handle extensionless imports
            if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
                absolutePath = path.join(absolutePath, 'index.js');
            } else if (!path.extname(absolutePath) && fs.existsSync(absolutePath + '.js')) {
                absolutePath += '.js';
            }

            if (fs.existsSync(absolutePath)) {
                // It's a valid local import
                if (usageCounts.has(absolutePath)) {
                    usageCounts.set(absolutePath, usageCounts.get(absolutePath) + 1);
                }
            }
        } catch (e) {
            // Ignore resolution errors
        }
    });
}

function generateReport() {
    console.log('🔍 Starting Dependency Map...');
    scanForFiles(ROOT_DIR);
    console.log(`📂 Found ${allFiles.length} files (.js, .html). Analyzing imports...`);

    allFiles.forEach(file => parseImports(file));

    const orphans = [];
    for (const [file, count] of usageCounts.entries()) {
        if (count === 0 && !file.endsWith('.html')) {
            // HTML files are entry points, usually 0 usage from others
            orphans.push(normalizePath(file));
        }
    }

    console.log('---------------------------------------------------');
    console.log(`👻 POTENTIAL ORPHANS (0 imports found form other JS/HTML files):`);
    console.log('   (Review carefully! Use usageCounts for validation)');
    orphans.forEach(f => console.log(`   - ${f}`));

    console.log('\n✅ Usage Analysis finished.');
}

generateReport();
