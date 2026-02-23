import { parse } from '@babel/parser';
import fs from 'fs';

const code = fs.readFileSync('client/components/BioEditor.jsx', 'utf8');

try {
  parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
} catch (e) {
  console.error(e.message);
  console.log('Location:', e.loc);
}
