
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const ROOT_DIR = process.cwd();
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.vscode', 'backstop_data', 'brain', 'tools'];
const EXCLUDE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf', '.DS_Store'];

// Stats
let filesScanned = 0;
const fileHashes = new Map(); // hash -> [filePaths]
const fileNames = new Map();  // fileName -> [filePaths]

function calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function scanDirectory(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const relativePath = path.relative(ROOT_DIR, fullPath);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(item)) {
                scanDirectory(fullPath);
            }
        } else {
            const ext = path.extname(item).toLowerCase();
            if (!EXCLUDE_EXTENSIONS.includes(ext)) {
                filesScanned++;

                // Track by Content (Exact Duplicates)
                const hash = calculateHash(fullPath);
                if (!fileHashes.has(hash)) {
                    fileHashes.set(hash, []);
                }
                fileHashes.get(hash).push(relativePath);

                // Track by Name (Shadow Duplicates)
                if (!fileNames.has(item)) {
                    fileNames.set(item, []);
                }
                fileNames.get(item).push(relativePath);
            }
        }
    }
}

function generateReport() {
    console.log('🔍 Scanning completed.');
    console.log(`📂 Files scanned: ${filesScanned}`);
    console.log('---------------------------------------------------');

    const exactDuplicates = [];
    for (const [hash, paths] of fileHashes.entries()) {
        if (paths.length > 1) {
            exactDuplicates.push(paths);
        }
    }

    const shadowDuplicates = [];
    for (const [name, paths] of fileNames.entries()) {
        if (paths.length > 1) {
            // Filter out if they are also exact duplicates (already reported)
            // Actually, showing them here is fine for context.
            shadowDuplicates.push({ name, paths });
        }
    }

    console.log(`\n🚨 EXACT DUPLICATES FOUND: ${exactDuplicates.length} groups`);
    console.log('   (These files have identical content)');
    exactDuplicates.forEach((group, index) => {
        console.log(`   Group ${index + 1}:`);
        group.forEach(p => console.log(`      - ${p}`));
    });

    console.log(`\n👻 SHADOW FILES (Same Name, Different Path): ${shadowDuplicates.length} groups`);
    console.log('   (These might have different content but verify if they are confusing)');
    shadowDuplicates.forEach(({ name, paths }) => {
        // Only show if not all paths are in exactDuplicates for this group
        // Simplification: Just show all name collisions for manual review
        console.log(`   File: ${name}`);
        paths.forEach(p => console.log(`      - ${p}`));
    });

    console.log('\n---------------------------------------------------');
    console.log('✅ Analysis finished.');
}

console.log(`🚀 Starting Clone Detection in: ${ROOT_DIR}`);
scanDirectory(ROOT_DIR);
generateReport();
