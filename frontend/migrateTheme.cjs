const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceRules = [
  { regex: /bg-slate-900\/40/g, replacement: 'bg-white dark:bg-slate-900/40' },
  { regex: /bg-slate-900\/60/g, replacement: 'bg-slate-50 dark:bg-slate-900/60' },
  { regex: /bg-slate-900\/80/g, replacement: 'bg-white dark:bg-slate-900/80' },
  { regex: /bg-slate-900\/90/g, replacement: 'bg-slate-50 dark:bg-slate-900/90' },
  { regex: /bg-slate-800\/80/g, replacement: 'bg-white dark:bg-slate-800/80' },
  { regex: /bg-slate-800\/60/g, replacement: 'bg-slate-50 dark:bg-slate-800/60' },
  { regex: /bg-slate-100\/90/g, replacement: 'bg-white dark:bg-slate-100/90' },
  { regex: /hover:bg-slate-900\/40/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-900/40' },
  { regex: /hover:bg-slate-900\/60/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-900/60' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      replaceRules.forEach(rule => {
        // Prevent double replacement if the file was already processed partially
        const safeRegex = new RegExp(`(?<!dark:)${rule.regex.source}`, 'g');
        content = content.replace(safeRegex, rule.replacement);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Migration complete.');
