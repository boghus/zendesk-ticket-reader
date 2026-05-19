import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  fs.rmSync('dist', { recursive: true, force: true });

  await esbuild.build({
    entryPoints: ['src/app/popup/popup.js'],
    bundle: true,
    minify: true,
    outfile: 'dist/popup.js',
  });

  await esbuild.build({
    entryPoints: ['src/app/content/content.js'],
    bundle: true,
    minify: true,
    outfile: 'dist/content.js',
  });

  fs.copyFileSync('src/app/popup/popup.html', 'dist/popup.html');
  fs.copyFileSync('src/app/popup/popup.css', 'dist/popup.css');
  fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
  copyDir('src/assets/icons', 'dist/icons');
}

await build();
