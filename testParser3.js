const { parse } = require('@babel/parser');
const fs = require('fs');
let content = fs.readFileSync('./client/components/BioEditor.jsx', 'utf8');
let lines = content.split('\n');

for (let i = 1110; i < 1118; i++) {
   console.log(`Line ${i+1}: ${lines[i]}`);
}

let code = '<> ' + lines.slice(537, 1115).join('\n') + '\n</>';
try {
  parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Parser SUCCESS with 1115!');
} catch (e) {
  console.error('Failed with 1115:', e.message);
}
