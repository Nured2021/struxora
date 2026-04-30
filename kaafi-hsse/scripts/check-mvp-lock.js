const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const blocked = [
  ['SAFE', 'WAY'],
  ['orch', 'estr', 'ator'],
  ['AI', 'router'],
  ['multi', 'model', 'system'],
  ['workflow', 'engine'],
  ['cel', 'ery'],
  ['que', 'ue'],
  ['event', 'bus'],
  ['micro', 'services'],
];

const ignoredDirectories = new Set(['node_modules', '.next', '.git']);
const ignoredFiles = new Set([path.basename(__filename)]);
const textExtensions = new Set([
  '.css',
  '.env',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sql',
  '.txt',
]);

function isBlocked(text) {
  const lower = text.toLowerCase();
  return blocked
    .map((parts) => parts.join('').toLowerCase())
    .filter((term) => lower.includes(term));
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        walk(path.join(directory, entry.name), files);
      }
      continue;
    }

    const filePath = path.join(directory, entry.name);
    if (!ignoredFiles.has(entry.name) && textExtensions.has(path.extname(entry.name))) {
      files.push(filePath);
    }
  }

  return files;
}

const violations = [];

for (const filePath of walk(root)) {
  const matches = isBlocked(fs.readFileSync(filePath, 'utf8'));
  if (matches.length) {
    violations.push({
      file: path.relative(root, filePath),
      matches,
    });
  }
}

if (violations.length) {
  console.error('KAAFI MVP lock failed:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.matches.join(', ')}`);
  }
  process.exit(1);
}

console.log('KAAFI MVP lock passed.');
