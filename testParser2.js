const { parse } = require('@babel/parser');
const fs = require('fs');

let content = fs.readFileSync('./client/components/BioEditor.jsx', 'utf8');
let lines = content.split('\n');

// start from line 538 `(div flex-1 flex flex-col overflow-hidden)`
// end at line 1114
let code = '<> ' + lines.slice(537, 1114).join('\n') + '\n</>';
try {
  parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Parser SUCCESS!');
} catch (e) {
  console.error(e.message);
}
