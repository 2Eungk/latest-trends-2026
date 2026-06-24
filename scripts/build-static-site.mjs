import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const outDir = join(root, 'dist', 'site');
const files = ['index.html', 'styles.css', 'app.js', 'README.md', 'QUICKSTART.md'];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of files) {
  copyFileSync(join(root, file), join(outDir, file));
}

console.log(`Built static site dist/site -> ${outDir}`);
