import * as esbuild from 'esbuild';
import fs from 'fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

async function build() {
  console.log('🚀 Iniciando build...');
  fs.rmSync('dist', { recursive: true, force: true });
  fs.mkdirSync('dist', { recursive: true });

  const entryPoints = [
    { in: 'src/app/popup/popup.js', out: 'dist/popup.js' },
    { in: 'src/app/content/content.js', out: 'dist/content.js' },
  ];

  for (const entry of entryPoints) {
    await esbuild.build({
      entryPoints: [entry.in],
      bundle: true,
      minify: true,
      sourcemap: true, // Facilita la revisión de Mozilla y el debugging
      outfile: entry.out,
      format: 'iife', // IIFE es más robusto para inyección de content scripts
    });
  }

  const tailwindBin = process.platform === 'win32'
    ? path.resolve('node_modules/.bin/tailwindcss.cmd')
    : path.resolve('node_modules/.bin/tailwindcss');

  execFileSync(tailwindBin, [
    '-c',
    'tailwind.config.js',
    '-i',
    'src/app/popup/popup.css',
    '-o',
    'dist/popup.css',
    '--minify',
  ], { stdio: 'inherit' });

  fs.copyFileSync('src/app/popup/popup.html', 'dist/popup.html');

  // Sincronización dinámica del manifest
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf-8'));
  
  manifest.version = pkg.version;
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  console.log(`info: Manifest generado en dist/ con versión ${pkg.version}`);
  
  // Usamos cpSync para simplificar la copia de directorios
  fs.cpSync('src/assets/icons', 'dist/icons', { recursive: true });
  
  console.log('✅ Build completado con éxito.');
  console.log('📂 Archivos generados en la carpeta /dist');
}

await build().catch((err) => {
  console.error('❌ Error durante el build:', err);
  process.exit(1);
});
