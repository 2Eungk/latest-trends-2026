import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const distDir = join(root, 'dist');
const packageDir = join(distDir, 'latest-trends-2026-demo');
const zipPath = join(distDir, 'latest-trends-2026-demo.zip');

const files = [
  'index.html',
  'app.js',
  'styles.css',
  'README.md'
];

rmSync(packageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(packageDir, { recursive: true });

for (const file of files) {
  const source = join(root, file);
  if (!existsSync(source)) {
    throw new Error(`Missing package file: ${file}`);
  }
  copyFileSync(source, join(packageDir, basename(file)));
}

execFileSync('zip', ['-qr', zipPath, 'latest-trends-2026-demo'], { cwd: distDir, stdio: 'inherit' });
console.log(`Packaged ${zipPath}`);
