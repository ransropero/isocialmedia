const fs = require('fs');
const content = fs.readFileSync('./client/components/BioEditor.jsx', 'utf8');

// A very naive JSX tag stack parser
const lines = content.split('\n');
let stack = [];
let i = 0;

for (let lineNum = 537; lineNum <= 1113; lineNum++) {
    const line = lines[lineNum];
    if(!line) continue;
    // this regex finds tags like <div, </div, <img/>, etc.
    const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const tag = match[1];
        const fullMatch = match[0];
        if (fullMatch.endsWith('/>')) {
            // self closing, ignore
        } else if (fullMatch.startsWith('</')) {
            if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
                stack.pop();
            } else {
                console.log(`Mismatch on line ${lineNum + 1}: Expected </${stack.length > 0 ? stack[stack.length-1].tag : 'NOTHING'}> but found ${fullMatch}`);
            }
        } else {
            stack.push({ tag, line: lineNum + 1, fullMatch });
        }
    }
}

console.log('Unclosed tags:', stack.map(s => `${s.tag} (line ${s.line})`));

