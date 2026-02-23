import { parse } from '@babel/parser';
import fs from 'fs';

let content = fs.readFileSync('./client/components/BioEditor.jsx', 'utf8');

// The ternary is on line 525: {!selectedPageId ? ( ... ) : ( ...EDITOR... )}
// Let's rip out just the EDITOR part to see if it parses as a JSX element
let lines = content.split('\n');
let editorLines = lines.slice(537, 1114);

let code = '<> ' + editorLines.join('\n') + '\n</>';

try {
  parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Parser SUCCESS!');
} catch (e) {
  console.error(e.message);
  console.log(e.loc);
}
