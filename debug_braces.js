const fs = require('fs');
const path = 'Shared/styles/views/_view-grid.scss';

try {
    const content = fs.readFileSync(path, 'utf8');
    let balance = 0;
    const stack = [];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
        // Strip comments roughly (not perfect but helpful)
        const cleanLine = line.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

        for (let char of cleanLine) {
            if (char === '{') {
                balance++;
                stack.push(index + 1);
            } else if (char === '}') {
                balance--;
                stack.pop();
            }
        }
    });

    console.log(`Final Balance: ${balance}`);
    console.log(`(Positive = Missing }, Negative = Extra })`);
    if (balance > 0) {
        console.log(`Potential unclosed blocks starting at lines: ${stack.slice(-3).join(', ')}`);
    }
} catch (e) {
    console.error(e);
}
