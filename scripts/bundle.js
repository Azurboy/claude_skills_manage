#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const outDir = join(projectRoot, 'bundle');

// Ensure output directory exists
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

async function bundle() {
  try {
    await esbuild.build({
      entryPoints: [join(projectRoot, 'dist/cli.js')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: join(outDir, 'skills-cli.js'),
      banner: {
        js: '#!/usr/bin/env node',
      },
      external: [],  // Bundle all dependencies
      minify: false, // Keep readable for debugging
      sourcemap: false,
    });

    console.log('✅ Bundle created: bundle/skills-cli.js');
    console.log('');
    console.log('To use:');
    console.log('  node bundle/skills-cli.js <command>');
    console.log('');
    console.log('Or copy to your skill repository:');
    console.log('  cp bundle/skills-cli.js /path/to/claude_skills_control/scripts/');
  } catch (error) {
    console.error('❌ Bundle failed:', error);
    process.exit(1);
  }
}

bundle();
