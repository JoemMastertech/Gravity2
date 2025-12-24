import fs from 'fs';
import path from 'path';

/**
 * SCSS Integrity Guard Plugin
 * Ensures all SCSS/CSS files in Shared/styles are imported in main.scss
 */
export default function scssAuditPlugin() {
    const STYLES_DIR = 'Shared/styles';
    const MAIN_FILE = 'Shared/styles/main.scss';

    // Normalize path to forward slashes for consistent comparison
    const normalize = (p) => p.split(path.sep).join('/');

    function getAllFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                getAllFiles(filePath, fileList);
            } else {
                // Track .scss and .css files
                if (file.endsWith('.scss') || file.endsWith('.css')) {
                    fileList.push(normalize(filePath));
                }
            }
        });

        return fileList;
    }

    function getImports(mainFilePath) {
        const content = fs.readFileSync(mainFilePath, 'utf-8');
        // Regex to capture @import "path"; or @import 'path';
        const regex = /@import\s+['"]([^'"]+)['"]/g;
        let imports = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            imports.push(match[1]);
        }

        return imports;
    }

    function audit() {
        // 1. Get Physical Files
        const physicalFiles = getAllFiles(STYLES_DIR);

        // 2. Get Imports from Manifest
        const declaredImports = getImports(MAIN_FILE);

        // 3. Resolve Imports to potential file paths
        const resolvedImports = new Set();

        declaredImports.forEach(imp => {
            // Import: "views/view-grid"
            // Potential matches: 
            // - Shared/styles/views/view-grid.scss
            // - Shared/styles/views/_view-grid.scss
            // - Shared/styles/views/view-grid.css

            const importPath = normalize(path.join(STYLES_DIR, imp));

            // Add exact match (for .css)
            resolvedImports.add(importPath);
            // Add .css extension
            resolvedImports.add(importPath + '.css');
            // Add .scss extension
            resolvedImports.add(importPath + '.scss');

            // Handle partials (add _ prefix to basename)
            const parts = importPath.split('/');
            const basename = parts.pop();
            const partialPath = [...parts, '_' + basename].join('/');

            resolvedImports.add(partialPath + '.scss');
            resolvedImports.add(partialPath + '.css'); // Unusual but possible
        });

        // 4. Find Orphans
        const orphans = physicalFiles.filter(file => {
            // Exclude main.scss itself
            if (file === normalize(MAIN_FILE)) return false;
            // Exclude build artifacts
            if (file.endsWith('/main.css') || file.endsWith('.map')) return false;

            // Check if file is in resolved imports
            return !resolvedImports.has(file);
        });

        // 5. Fatal Error
        if (orphans.length > 0) {
            const errorMsg = `
[SCSS AUDIT ERROR] 🚨 Security Breach Detected!
The following files exist in the filesystem but are NOT imported in ${MAIN_FILE}:

${orphans.map(f => ` - ${f}`).join('\n')}

System halted. Please add these files to main.scss or delete them.
            `;
            console.error('\x1b[31m%s\x1b[0m', errorMsg); // Red text
            throw new Error(errorMsg);
        }

        console.log('\x1b[32m%s\x1b[0m', '[SCSS AUDIT] ✅ All styles accounted for.');
    }

    return {
        name: 'scss-audit-guard',
        buildStart() {
            audit();
        },
        handleHotUpdate({ file }) {
            if (file.endsWith('.scss') || file.endsWith('.css')) {
                audit();
            }
        }
    };
}
