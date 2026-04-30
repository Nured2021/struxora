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
const allowedManualModelTerms = new Set([
  ['mis', 'tral'].join(''),
  ['gem', 'ma'].join(''),
  ['phi', '-3'].join(''),
  ['phi', '3'].join(''),
]);

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

function hasAllowedManualModelTerm(text) {
  const lower = text.toLowerCase();
  return [...allowedManualModelTerms].some((term) => lower.includes(term));
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
  const contents = fs.readFileSync(filePath, 'utf8');
  const matches = isBlocked(contents);
  const relativeFile = path.relative(root, filePath);
  const isAiConnector = relativeFile.startsWith(`backend${path.sep}ai${path.sep}`) && relativeFile.endsWith('.connector.js');
  const isAiController = relativeFile === path.join('backend', 'controllers', 'ai.controller.js');
  const isAiRoutes = relativeFile === path.join('backend', 'routes', 'ai.routes.js');
  const isAiPage = relativeFile === path.join('frontend', 'pages', 'ai.js');
  const isDoc = relativeFile.startsWith(`docs${path.sep}`);
  const isReadme =
    relativeFile === 'README.md' ||
    relativeFile === path.join('backend', 'README.md') ||
    relativeFile === path.join('frontend', 'README.md');
  const allowedManualModelMention =
    hasAllowedManualModelTerm(contents) && (isAiConnector || isAiController || isAiRoutes || isAiPage || isDoc || isReadme);

  if (matches.length) {
    violations.push({
      file: relativeFile,
      matches,
    });
  } else if (hasAllowedManualModelTerm(contents) && !allowedManualModelMention) {
    violations.push({
      file: relativeFile,
      matches: ['manual model term outside allowed files'],
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
