const fs = require('fs');
const path = 'Shared/styles/tools/_mixins.scss';

try {
    if (!fs.existsSync(path)) { console.error(`File not found: ${path}`); process.exit(1); }
    const content = fs.readFileSync(path, 'utf8');
    let balance = 0;

    // Simple parser
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

    for (let char of cleanContent) {
        if (char === '{') balance++;
        else if (char === '}') balance--;
    }

    console.log(`Final Balance: ${balance}`);
    if (balance > 0) console.log(`MISSING ${balance} closing brace(s).`);
    else if (balance < 0) console.log(`EXTRA ${Math.abs(balance)} closing brace(s).`);
    else console.log("PERFECTLY BALANCED.");
} catch (e) { console.error(e); }
